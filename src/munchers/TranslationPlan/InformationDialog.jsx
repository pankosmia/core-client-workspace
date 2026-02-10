import {
    DialogContent,
    DialogContentText,
    Typography,
} from "@mui/material";
import { PanDialog,PanDialogActions } from 'pankosmia-rcl';
import { doI18n } from "pithekos-lib";
import { useContext } from "react";
import {i18nContext} from 'pankosmia-rcl'
function InformationDialog({ theme, planIngredient, openDialogAbout, setOpenDialogAbout }) {
    const { i18nRef } = useContext(i18nContext);
    
    return <PanDialog
        titleLabel={`${doI18n(`pages:core-local-workspace:about_dialog`, i18nRef.current)} - ${planIngredient.name} `}
        isOpen={openDialogAbout}
        closeFn={() => setOpenDialogAbout(false)}
        theme={theme}
    >
        <DialogContent>
            {Object.entries(planIngredient).map(([key, value]) => {
                const hiddenKeys = ["sectionStructure", "sections", "fieldInitialValues", "short_name", "versification","name"]
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