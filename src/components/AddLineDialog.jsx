import { useState, useContext } from "react";
import { AppBar, Dialog, IconButton, Toolbar, Typography } from "@mui/material";
import { Close as CloseIcon } from '@mui/icons-material';
import TsvLineForm from "./TsvLineForm";
import {
    i18nContext as I18nContext,
    doI18n,
} from "pithekos-lib";

function AddLineDialog({ open, closeModal,ingredient, setIngredient,currentRowN, setCurrentRowN, setIngredientValueChanged, setSaveIngredientValue }) {
    const { i18nRef } = useContext(I18nContext);
    const [newCurrentRow, setNewCurrentRow] = useState((ingredient[0] || []).map(c => ""));

    const handleClose = () => {
        closeModal();
    }

    // Permet de sauvegarder la nouvelle note
    const handleSaveNewTsvRow = (rowN, newRow) => {
        const newIngredient = [...ingredient];
        newIngredient.push(newRow);
        setIngredient(newIngredient);
        setIngredientValueChanged(true);
    };

    return (
        <Dialog
            fullScreen
            open={open}
            onClose={handleClose}>
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleClose}
                    >
                        <CloseIcon />
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            {doI18n("pages:core-local-workspace:new_bcv_note", i18nRef.current)}
                        </Typography>
                    </IconButton>

                </Toolbar>
            </AppBar>
            <TsvLineForm
                mode="add"
                currentRow={newCurrentRow}
                currentRowN={currentRowN}
                ingredient={ingredient}
                setIngredient={setIngredient}
                saveFunction={handleSaveNewTsvRow}
                setSaveIngredientValue={setSaveIngredientValue}
            />
        </Dialog>
    )
}

export default AddLineDialog;
