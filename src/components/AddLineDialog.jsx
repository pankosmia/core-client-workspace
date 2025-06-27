import { useState } from "react";
import { Box, Dialog, Button } from "@mui/material";
import TsvLineForm from "./TsvLineForm";

function AddLineDialog({ open, closeModal, setCurrentRowN, currentRowN, ingredient, setIngredient, }) {

    const [changeCellValue, setChangeCellValue] = useState(false);
    const [newCurrentRow, setNewCurrentRow] = useState((ingredient[0] || []).map(c => ""));

    const handleClose = () => {
        closeModal();
    }

    // Permet de sauvegarder la nouvelle note
    const handleSaveNewTsvRow = (rowN) => {
    const newIngredient = [...ingredient];
    newIngredient.push(newCurrentRow);
    setIngredient(newIngredient);
    };

    return (
        <Dialog
            maxWidth="1000px"
            open={open}
            onClose={handleClose}>

            <TsvLineForm
                mode="add"
                currentRow={newCurrentRow}
                ingredient={ingredient}
                saveFunction={handleSaveNewTsvRow}
            />
            <Box sx={{ display: 'flex', gap: 2, padding: 2 }}>
                <Button
                    onClick={() => handleSaveNewTsvRow(currentRowN)}
                    variant="contained"
                    disabled={!changeCellValue}
                    sx={{
                        mt: 2,
                        backgroundColor: changeCellValue ? 'primary' : 'grey.400',
                        color: 'white',
                    }}
                >
                    Enregistrer la nouvelle note
                </Button>
            </Box>

        </Dialog>
    )
}

export default AddLineDialog;
