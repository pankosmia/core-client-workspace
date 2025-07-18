import { useContext, useState } from "react";
import {
    i18nContext as I18nContext,
    debugContext as DebugContext,
    bcvContext as BcvContext,
    doI18n,
    postJson
} from "pithekos-lib";
import { enqueueSnackbar } from "notistack";
import { IconButton } from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import md5 from "md5";

function SaveTsvButton({ ingredient, metadata, md5Ingredient, setMd5Ingredient }) {
    const { systemBcv } = useContext(BcvContext);
    const { i18nRef } = useContext(I18nContext);
    const [contentChanged, _setContentChanged] = useState(false);

    // Met à jour le fichier TSV
    const uploadTsvIngredient = async (tsvData, debugBool) => {
        const tsvString = tsvData
            .map(
                r => r.map(
                    c => c.replace(/\n/g, "\\n")
                )
            )
            .map(r => r.join("\t"))
            .filter(r => r.trim().length > 0)
            .join("\n");
        const payload = JSON.stringify({ payload: tsvString });
        const response = await postJson(
            `/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.tsv`,
            payload,
            debugBool
        );
        if (response.ok) {
            enqueueSnackbar(
                `${doI18n("pages:core-local-workspace:saved", i18nRef.current)}`,
                { variant: "success" }
            );
            setContentChanged(false);
        } else {
            enqueueSnackbar(
                `${doI18n("pages:core-local-workspace:save_error", i18nRef.current)}: ${response.status}`,
                { variant: "error" }
            );
            throw new Error(`Failed to save: ${response.status}, ${response.error}`);
        }
    }

    // Montre le changement d'état du contenu 
    const setContentChanged = nv => {
        _setContentChanged(nv);
    }
    // Permet de sauvegarder dans le fichier TSV 
    const handleSaveTsv = () => {
        setMd5Ingredient(md5(JSON.stringify(ingredient)))
        uploadTsvIngredient([...ingredient])
    }
    return (
        <IconButton
            disabled={md5(JSON.stringify(ingredient)) === md5Ingredient}
            sx={{
                mt: 2,
                "&.Mui-disabled": {
                    backgroundColor: '#eaeaea',
                    color: '#bebbbbff',
                },
            }}
            variant="contained"
            onClick={() => { handleSaveTsv() }} >
            <SaveIcon
                size="large" color={md5(JSON.stringify(ingredient)) === md5Ingredient ? "#eaeaea" : "primary"}
            />
        </IconButton>
    )
}
export default SaveTsvButton;