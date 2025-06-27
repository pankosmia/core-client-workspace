import { useState, useEffect } from "react";
import { TextField, Button, FormControl, Box } from "@mui/material";
import MarkdownField from "./MarkdownField"
import TsvLineForm from "./TsvLineForm";
function Editor({ingredient, setIngredient, currentRowN, setCurrentRowN, ingredientHasChanged, setIngredientHasChanged }) {
    const [currentRow, setCurrentRow] = useState([]);

    useEffect(
        () => {
            if (ingredient.length > 0) {
                setCurrentRow(ingredient[currentRowN]);
            }
        },
        [ingredient, currentRowN]
    );

    //Permet de sauvegarder les changements apportés dans les notes
    // const handleSaveRow = (rowN) => {
    //     const newIngredient = [...ingredient]
    //     newIngredient[rowN] = currentRow
    //     setIngredient(newIngredient);
    //     console.log("newcurrentrow", newIngredient)
    // };

    const handleSaveRow = (rowN, newRow) => {
        const newIngredient = [...ingredient]
        newIngredient[rowN] = [...newRow]
        setIngredient(newIngredient);
        console.log("newcurrentrow", newIngredient)
    };

    return <Box sx={{ display: 'flex', flexDirection:"column", gap: 2, padding: 2 }}>
            <TsvLineForm
                mode="edit"
                currentRow={currentRow}
                currentRowN={currentRowN}
                ingredient={ingredient}
                setIngredient={setIngredient}
                saveFunction={handleSaveRow}
                ingredientHasChanged={ingredientHasChanged}
                setIngredientHasChanged={setIngredientHasChanged}
            />
            </Box>;
}

export default Editor;
