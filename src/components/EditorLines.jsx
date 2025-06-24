import { useState } from "react";
import { TextField, Button, FormControl, Box } from "@mui/material";
import EditorNote from "./EditorNote"

function EditorLines({ currentRow, ingredient, setIngredient, setCurrentRow }) {
    const [changeCellValue, setChangeCellValue] = useState(false);

    // Inialisation des données au départ
    const columnNames = ingredient[0] || [];

    // Permet la modification d'une note
    const changeCell = (event, n) => {
        const newCellValue = event.target.value;
        const newCurrentRow = {
            ...currentRow,
            content: [...currentRow.content]
        };
        newCurrentRow.content[n] = newCellValue;
        setCurrentRow(newCurrentRow);
        setChangeCellValue(true);
    };

    // Permet de sauvegarder les changements apportés dans les notes 
    const handleSaveRow = (rowN) => {
        const newIngredient = [...ingredient]
        newIngredient[rowN] = currentRow.content
        setIngredient(newIngredient);
        console.log("newcurrentrow", newIngredient)
    };

    // Permet d'annuler les modications faites sur la note 
    const handleCancel = (rowN) => {
        const newRowValue = ingredient[rowN]
        const newCurrentRow = {
            ...currentRow,
            content: [...newRowValue]
        };
        setCurrentRow(newCurrentRow);
        console.log("newcurrentrow", newCurrentRow)
    };

    return (
        <Box>
            {columnNames.map((column, n) => (
                <FormControl fullWidth margin="normal" key={n}>
                    {column === 'Note' ? (
                        <EditorNote
                            currentRow={currentRow}
                            columnNames={columnNames}
                            onChangeNote={(e) => changeCell(e, n)}

                        />
                    ) : (
                        <TextField
                            label={column}
                            value={currentRow.content[n] || ''}
                            variant="outlined"
                            fullWidth
                            size="small"
                            onChange={(e) => changeCell(e, n)}
                        />
                    )}

                </FormControl>
            ))}
            <Box sx={{ display: 'flex', gap: 2, padding: 2 }}>
                <Button
                    onClick={() => handleSaveRow(currentRow.n)}
                    variant="contained"
                    disabled={!changeCellValue}
                    sx={{
                        mt: 2,
                        backgroundColor: changeCellValue ? 'primary' : 'grey.400',
                        color: 'white',

                    }}
                >
                    ok
                </Button>
                <Button onClick={() => handleCancel(currentRow.n)} variant="contained" disabled={!changeCellValue} sx={{
                    mt: 2,
                    backgroundColor: changeCellValue ? 'primary' : 'grey.400',
                    color: 'white',
                }}>Annuler</Button>
            </Box>

        </Box>
    );
}

export default EditorLines;
