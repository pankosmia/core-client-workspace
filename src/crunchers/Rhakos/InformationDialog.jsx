import { DialogContent, DialogContentText, Grid2 } from "@mui/material";
import { PanDialog } from "pankosmia-rcl";
import { doI18n } from "pithekos-lib";
import { useContext } from "react";
import { i18nContext } from "pankosmia-rcl";

export default function InformationDialogRhakos({ open, close, response }) {
    const { i18nRef } = useContext(i18nContext);

    return (
        <PanDialog
            titleLabel={doI18n("pages:core-local-workspace:info_rhakos", i18nRef.current)}
            isOpen={open}
            closeFn={() => close(false)}
        >
            <DialogContent>
                <>
                    <DialogContentText>
                        {doI18n("pages:core-local-workspace:elapsed_rhakos", i18nRef.current)} : {parseFloat(response?.json?.elapsed.toFixed(2))}  {doI18n("pages:core-local-workspace:second", i18nRef.current)}
                    </DialogContentText>
                    <DialogContentText>
                        {doI18n("pages:core-local-workspace:submitted_rhakos", i18nRef.current)} :
                        {response?.json?.submitted
                            ? new Date(response.json.submitted * 1000).toLocaleString()
                            : "—"}
                    </DialogContentText>
                    <DialogContentText>
                        {doI18n("pages:core-local-workspace:model_rhakos", i18nRef.current)} :  {response?.json?.model_name}
                    </DialogContentText>
                    <DialogContentText>
                        {doI18n("pages:core-local-workspace:bcv_rhakos", i18nRef.current)} :  {response?.json?.book}   {response?.json?.from_chapter}   {response?.json?.from_verse}
                    </DialogContentText>
                    <DialogContentText>
                        {response?.json?.quantized === true ?
                            `${doI18n("pages:core-local-workspace:quantized_rhakos", i18nRef.current)} :  true`
                            : `${doI18n("pages:core-local-workspace:quantized_rhakos", i18nRef.current)} :  false`}
                    </DialogContentText>
                    <DialogContentText>
                        {doI18n("pages:core-local-workspace:topk_rhakos", i18nRef.current)} : {response?.json?.top_k}
                    </DialogContentText>
                    <DialogContentText>
                        {doI18n("pages:core-local-workspace:temperature_rhakos", i18nRef.current)} :  {response?.json?.temperature}
                    </DialogContentText>
                </>
            </DialogContent>
        </PanDialog>
    )
}