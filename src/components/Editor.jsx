import { useState } from "react";
import { TextField, Button, FormControl, Box } from "@mui/material";
import MarkdownField from "./MarkdownField"
import LineForm from "./LineForm";
function Editor({ currentRow, ingredient, setIngredient, setCurrentRow }) {

    // Permet de sauvegarder les changements apportés dans les notes 
    const handleSaveRow = (rowN) => {
        const newIngredient = [...ingredient]
        newIngredient[rowN] = currentRow.content
        setIngredient(newIngredient);
        console.log("newcurrentrow", newIngredient)
    };

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection:"column", gap: 2, padding: 2 }}>
            <LineForm 
                mode="Edit"
                currentRow={currentRow} 
                setCurrentRow={setCurrentRow} 
                ingredient={ingredient}
                saveFunction={handleSaveRow}
            />
                
            </Box>
        </>

    );
}

export default Editor;
