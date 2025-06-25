import { useContext, useState } from "react";
import {
    i18nContext as I18nContext,
    debugContext as DebugContext,
    bcvContext as BcvContext,
    doI18n,
    postJson
} from "pithekos-lib";
import { enqueueSnackbar } from "notistack";
import { Button } from "@mui/material";

function SaveTsvIngredient({ingredient, metadata}) {

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
        console.log("setContentChanged", nv);
        _setContentChanged(nv);
    }
    // Permet de sauvegarder dans le fichier TSV 
    const handleSaveTsv = () => {
        uploadTsvIngredient([...ingredient])
    }
    return (
        <Button onClick={() => handleSaveTsv()} variant="contained" sx={{
            mt: 2,

        }}>Sauvegarder le TSV </Button>
    )
}
export default SaveTsvIngredient;