import { useState } from "react";
import { TextField, Box, Dialog, FormControl, Button } from "@mui/material";
import EditorNoteOneLine from "./EditorNoteOneLine";

function EditorOneLine({ open, closeModal, setCurrentRow, currentRow, ingredient, setIngredient }) {
    const [changeCellValue, setChangeCellValue] = useState(false);
    const columnNames = ingredient[0] || [];

    const handleClose = () => {
        closeModal();
    }

    //Permet d'ajouter une nouvelle note
     const addRow = (event, n) => {
        const addCellTsvValue = event.target.value;
        const addNewTsvRow = {
            ...currentRow,
            content: [...currentRow.content]
        };
        addNewTsvRow.content[n] = addCellTsvValue;
        setCurrentRow(addNewTsvRow);
        setChangeCellValue(true);
    };

    // Permet de sauvegarder la nouvelle note
    const handleSaveNewTsvRow = (addTsvRowN) => {
        const newIngredientNote = [...ingredient]
        newIngredientNote[addTsvRowN] = currentRow.content
        setIngredient(newIngredientNote);
        console.log("newcurrentrow", newIngredientNote)
    };

    return (
        <Dialog
            maxWidth="1000px"
            open={open}
            onClose={handleClose}>
            <Box sx={{ padding: 1, justifyContent: "center" }}>
                {columnNames.map((column, addTsvROw) => (
                    <FormControl fullWidth margin="normal" key={addTsvROw}>
                        {column === 'Note' ? (
                            <EditorNoteOneLine
                                currentRow={currentRow}
                                columnNames={columnNames}
                                onChangeNote={(e) => addRow(e, addTsvROw)}
                            />
                        ) : (
                            <TextField
                                label={`Nouvelle ${column}`}
                                value={currentRow.content[n]}
                                variant="outlined"
                                fullWidth
                                size="small"
                                onChange={(e) => addRow(e, n)}
                            />
                        )}
                    </FormControl>
                ))}
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
            </Box>
        </Dialog>
    )
}

export default EditorOneLine;
