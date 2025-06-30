import { useState } from "react";
import { Dialog } from "@mui/material";
import TsvLineForm from "./TsvLineForm";

function AddLineDialog({ open, closeModal, setCurrentRowN, currentRowN, ingredient, setIngredient, }) {

    const [newCurrentRow, setNewCurrentRow] = useState((ingredient[0] || []).map(c => ""));

    const handleClose = () => {
        closeModal();
    }

    // Permet de sauvegarder la nouvelle note
    const handleSaveNewTsvRow = (rowN, newRow) => {
        const newIngredient = [...ingredient];
        newIngredient.push(newRow);
        setIngredient(newIngredient);
    };

    return (
        <Dialog
            fullScreen
            open={open}
            onClose={handleClose}>

            <TsvLineForm
                mode="add"
                currentRow={newCurrentRow}
                currentRowN={currentRowN}
                ingredient={ingredient}
                saveFunction={handleSaveNewTsvRow}
            />
        </Dialog>
    )
}

export default AddLineDialog;
