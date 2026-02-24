import { DialogContent, Grid2 } from "@mui/material";
import { PanDialog } from "pankosmia-rcl";
import { doI18n } from "pithekos-lib";
import { useContext } from "react";
import { i18nContext } from "pankosmia-rcl";

export default function InformationDialogRhakos({ open, close }) {
    const { i18nRef } = useContext(i18nContext);

    return (
        <PanDialog
            titleLabel={doI18n("pages:core-local-workspace:settings_rhakos", i18nRef.current)}
            isOpen={open}
            closeFn={() => close(false)}
        >
            <DialogContent>
                <Grid2 item size={2}>
                    {doI18n("pages:core-local-workspace:model_rhakos", i18nRef.current)}
                </Grid2>
                <Grid2 item size={10}>
                    lol
                </Grid2>
            </DialogContent>
        </PanDialog>
    )
}