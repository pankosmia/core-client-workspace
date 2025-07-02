import { useContext, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from "@mui/material";
import TsvLineForm from "./TsvLineForm";
import {
    i18nContext as I18nContext,
    doI18n,
} from "pithekos-lib";

function DeleteNote({open, ingredient, setIngredient,closeModal }) {
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
        <DialogTitle><b>{doI18n("pages:core-local-workspace:editing", i18nRef.current)}</b></DialogTitle>
        <DialogContent>
            <DialogContentText>
                <Typography variant="h6">
                </Typography>
                <Typography>
                    {doI18n("pages:core-local-workspace:editing", i18nRef.current)}
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
                    handleDeleteRow(rowN);
                    handleClose();
                }}
            >{doI18n("pages:core-local-workspace:editing", i18nRef.current)}</Button>
        </DialogActions>
        <TsvLineForm DeleteNote={DeleteNote} />
    </Dialog>;
}
export default DeleteNote;