import { useState, useEffect } from "react";
import { TextField, Button, FormControl, Box } from "@mui/material";
import MarkdownField from "./MarkdownField"
import TsvLineForm from "./TsvLineForm";
function Editor({ingredient, setIngredient, currentRowN, setCurrentRowN }) {
    const [currentRow, setCurrentRow] = useState([]);

    useEffect(
        () => {
            if (ingredient.length > 0) {
                setCurrentRow(ingredient[currentRowN]);
            }
        },
        [ingredient, currentRowN]
    );

    // Permet de sauvegarder les changements apportés dans les notes
    const handleSaveRow = (rowN) => {
        const newIngredient = [...ingredient]
        newIngredient[rowN] = currentRow
        setIngredient(newIngredient);
        console.log("newcurrentrow", newIngredient)
    };

    return <Box sx={{ display: 'flex', flexDirection:"column", gap: 2, padding: 2 }}>
            <TsvLineForm
                mode="edit"
                currentRow={currentRow}
                ingredient={ingredient}
                saveFunction={handleSaveRow}
            />
            </Box>;
}

export default Editor;
