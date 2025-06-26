import { useState } from "react";
import { Box, Dialog, FormControl, Button } from "@mui/material";
import LineForm from "./LineForm";

function AddLineDialog({ open, closeModal, setCurrentRow, currentRow, ingredient, setIngredient, }) {

    const [changeCellValue, setChangeCellValue] = useState(false);
    const [addCurrentRow, setAddCurrentRow] = useState({ n: 1, content: [] });

    const handleClose = () => {
        closeModal();
    }

    //Permet d'ajouter une nouvelle note
    const changeCell = (event, n) => {
        const addCellTsvValue = event.target.value;
        const addNewTsvRow = {
            ...addCurrentRow,
            content: [...addCurrentRow.content]
        };
        addNewTsvRow.content[n] = addCellTsvValue;
        setAddCurrentRow(addNewTsvRow);
        setChangeCellValue(true);
        console.log("addcurrentrow", addCurrentRow)
    };

    // Permet de sauvegarder la nouvelle note
    const handleSaveNewTsvRow = (rowN) => {
    const newIngredientNote = [...ingredient];
    const newLines = [...addCurrentRow.content]; 
    newIngredientNote.push(newLines);
    setIngredient(newIngredientNote);
    };

    return (
        <Dialog
            maxWidth="1000px"
            open={open}
            onClose={handleClose}>

            <LineForm 
                mode="Add"
                currentRow="" 
                ingredient={ingredient}
                saveFunction={handleSaveNewTsvRow}
            />
            <Box sx={{ display: 'flex', gap: 2, padding: 2 }}>
                <Button
                    onClick={() => handleSaveNewTsvRow(currentRow.n)}
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
