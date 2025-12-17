import { IconButton } from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import md5 from "md5";
import { doI18n, postJson } from "pithekos-lib";
import { enqueueSnackbar } from "notistack";
import I18nContext from "pithekos-lib/dist/contexts/i18nContext";
import { useContext, useState } from "react";
import draftJson2usfm from "../../../../components/draftJson2usfm";

function SaveButton({ metadata, systemBcv,modified, setModified, setSavedChecksum, scriptureJson }) {
    const { i18nRef } = useContext(I18nContext);

    // Permet de sauvegarder dans le fichier TSV 
    const handleSaveUsfm = async (debugBool) => {
        let usfm = draftJson2usfm(scriptureJson)
        const payload = JSON.stringify({ payload: usfm });
        const response = await postJson(
            `/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.usfm`,
            payload,
            debugBool
        );
        console.log("response",response);
        if (response.ok) {
            enqueueSnackbar(
                `${doI18n("pages:core-local-workspace:saved", i18nRef.current)}`,
                { variant: "success" }
            );
            setSavedChecksum(md5(JSON.stringify(scriptureJson, null, 2)));
            setModified(false);
        } else {
            enqueueSnackbar(
                `${doI18n("pages:core-local-workspace:save_error", i18nRef.current)}: ${response.status}`,
                { variant: "error" }
            );
        }
    }

    return (
        <IconButton
            variant="contained"
            onClick={() => { handleSaveUsfm().then() }}
            //disabled={!modified}
        >
            <SaveIcon
                size="large"
            />
        </IconButton>
    )
}
export default SaveButton;