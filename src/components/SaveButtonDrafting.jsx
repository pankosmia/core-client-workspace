import { IconButton } from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import md5 from "md5";
import { doI18n, postJson } from "pithekos-lib";
import { enqueueSnackbar } from "notistack";
import I18nContext from "pithekos-lib/dist/contexts/i18nContext";
import { useContext, useState } from "react";

function SaveButtonDrafting({ metadata, systemBcv, usfmHeader, unitData }) {
    const { i18nRef } = useContext(I18nContext);
    const [contentChanged, _setContentChanged] = useState(false);

    // Permet de sauvegarder dans le fichier TSV 
    const handleSaveUsfm = async (debugBool) => {
        let contentBits = [usfmHeader]
        let chapterN = "0";
        for (const unit of unitData) {
            const chapter = unit.reference.split(":")[0]
            if (chapterN !== chapter) {
                contentBits.push(`\\c ${chapter}`)
                chapterN = chapter
            }
            contentBits.push("\\p")
            contentBits.push(`\\v ${unit.reference.split(":")[1]}`)
            contentBits.push(unit.text.split(/\n{2,}/).join("\n\\p"))
        }
        const payload = JSON.stringify({ payload: contentBits.join("\n") });
        const response = await postJson(
            `/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.usfm`,
            payload,
            debugBool
        );

        //setMd5Ingredient(md5(JSON.stringify()))
        //uploadUsfmIngredient([...])
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
    return (
        <IconButton
            variant="contained"
            onClick={() => { handleSaveUsfm() }}
        >
            <SaveIcon
                size="large"
            />
        </IconButton>
    )
}
export default SaveButtonDrafting;