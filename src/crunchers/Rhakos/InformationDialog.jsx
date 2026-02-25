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
                {response.map(r => (
                    <>
                        <DialogContentText>
                            {doI18n("pages:core-local-workspace:model_rhakos", i18nRef.current)} :  {r.json.model_name}
                        </DialogContentText>
                        <DialogContentText>
                            {doI18n("pages:core-local-workspace:bcv_rhakos", i18nRef.current)} :  {r.json.book}   {r.json.from_chapter}   {r.json.from_verse}
                        </DialogContentText>
                        <DialogContentText>
                            {r.json.quantized === true ?
                                `${doI18n("pages:core-local-workspace:quantized_rhakos", i18nRef.current)} :  true`
                                :`${doI18n("pages:core-local-workspace:quantized_rhakos", i18nRef.current)} :  false`}
                        </DialogContentText>
                        <DialogContentText>
                            {doI18n("pages:core-local-workspace:topk_rhakos", i18nRef.current)} : {r.json.top_k}
                        </DialogContentText>
                        <DialogContentText>
                            {doI18n("pages:core-local-workspace:elapsed_rhakos", i18nRef.current)} : {r.json.elapsed}
                        </DialogContentText>
                        <DialogContentText>
                            {doI18n("pages:core-local-workspace:temperature_rhakos", i18nRef.current)} :  {r.json.temperature}
                        </DialogContentText>
                        <DialogContentText>
                            {doI18n("pages:core-local-workspace:submitted_rhakos", i18nRef.current)} :  {r.json.submitted}
                        </DialogContentText>
                    </>
                ))}
            </DialogContent>
        </PanDialog>
    )
}