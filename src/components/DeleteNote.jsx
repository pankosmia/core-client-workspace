import { useContext } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from "@mui/material";
import {
    i18nContext as I18nContext,
    doI18n,
} from "pithekos-lib";

function DeleteNote({open,closeModal, ingredient, setIngredient, rowData }) {
    const { i18nRef } = useContext(I18nContext);

    const handleClose = () => {
        closeModal();
    }

    const handleDeleteRow = (rowN) => {
        const newIngredient = [...ingredient]
        newIngredient.splice(rowN, 1)
        setIngredient(newIngredient)
    };
    return <Dialog
        open={open}
        onClose={handleClose}
        slotProps={{
            paper: {
                component: 'form',
            },
        }}
    >
        <DialogTitle><b>Référence de la note : {rowData[0]} - {rowData[1]}</b></DialogTitle>
        <DialogContent>
            <DialogContentText>
                <Typography variant="h6">
                    {doI18n("pages:core-local-workspace:delete_note_bcv", i18nRef.current)}
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
                    handleDeleteRow();
                    handleClose();
                }}
            >{doI18n("pages:core-local-workspace:do_delete_button", i18nRef.current)}</Button>
        </DialogActions>
    </Dialog>;
}
export default DeleteNote;