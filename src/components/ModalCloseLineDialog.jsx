import { useContext } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from "@mui/material";
import {
    i18nContext as I18nContext,
    doI18n,
} from "pithekos-lib";

function ModalCLoseLineDialog({open,closeModal,cellValueChanged, setCellValueChanged, handleCloseModalMain }) {

    const { i18nRef } = useContext(I18nContext);

    const handleClose = () => {
        closeModal();
        if(cellValueChanged === true)
        handleCloseModalMain()
    }

    return <Dialog
        open={open}
        onClose={handleClose}
        slotProps={{
            paper: {
                component: 'form',
            },
        }}
    >
        <DialogTitle><b>Référence de la note</b></DialogTitle>
        <DialogContent>
            <DialogContentText>
                <Typography variant="h6">
                    {doI18n("pages:core-local-workspace:save_your_work", i18nRef.current)}
                </Typography>
              
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>
                {doI18n("pages:core-local-workspace:cancel", i18nRef.current)}
            </Button>
            <Button
                color="warning"
                onClick={() => {
                    handleDeleteRow(currentRowN);
                    handleClose();
                }}
            >{doI18n("pages:core-local-workspace:do_delete_button", i18nRef.current)}</Button>
        </DialogActions>
    </Dialog>;
}
export default ModalCLoseLineDialog;