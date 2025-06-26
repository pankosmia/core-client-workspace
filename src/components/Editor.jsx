import { useState } from "react";
import { TextField, Button, FormControl, Box } from "@mui/material";
import MarkdownField from "./MarkdownField"
import LineForm from "./LineForm";
function Editor({ currentRow, ingredient, setIngredient, setCurrentRow }) {

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
        <>
            <Box sx={{ display: 'flex', flexDirection:"column", gap: 2, padding: 2 }}>
            <LineForm mode='editor' valeur="1" changeCell={changeCell} currentRow={currentRow} setCurrentRow={setCurrentRow} ingredient={ingredient} setIngredient={setIngredient} />
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
                    Ok
                </Button>
                <Button onClick={() => handleCancel(currentRow.n)} variant="contained" disabled={!changeCellValue} sx={{
                    mt: 2,
                    backgroundColor: changeCellValue ? 'primary' : 'grey.400',
                    color: 'white',
                }}>Annuler</Button>
            </Box>
        </>

    );
}

export default Editor;
