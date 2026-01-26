import {
    DialogContent,
    DialogContentText,
    Typography,
} from "@mui/material";
import {PanDialog} from 'pankosmia-rcl';

function InformationDialog({theme, planIngredient, openDialogAbout, setOpenDialogAbout}) {
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
    </PanDialog>
}

export default InformationDialog;