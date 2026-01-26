import {
    DialogContent,
    DialogContentText,
    Typography,
} from "@mui/material";
import { PanDialog,PanDialogActions } from 'pankosmia-rcl';
import { doI18n, i18nContext } from "pithekos-lib";
import { useContext } from "react";

function InformationDialog({ theme, planIngredient, openDialogAbout, setOpenDialogAbout }) {
    const { i18nRef } = useContext(i18nContext);
    
    return <PanDialog
        titleLabel="About"
        isOpen={openDialogAbout}
        closeFn={() => setOpenDialogAbout(false)}
        theme={theme}
    >
        <DialogContent>
            {Object.entries(planIngredient).map(([key, value]) => {
                const hiddenKeys = ["sectionStructure", "sections", "fieldInitialValues", "short_name", "versification"]
                if (hiddenKeys.includes(key)) {
                    return null;
                }
                return (
                    <DialogContentText key={key} mb={2}>
                        <Typography fullWidth size="small">
                            {value}
                        </Typography>
                    </DialogContentText>
                );
            }
            )
            }
        </DialogContent>
        <PanDialogActions
            onlyCloseButton={true}
            closeFn={() => setOpenDialogAbout(false)}
            closeLabel={doI18n(`pages:core-local-workspace:close`, i18nRef.current)}
        />
    </PanDialog>
}

export default InformationDialog;