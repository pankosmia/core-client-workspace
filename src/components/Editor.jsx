import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import TsvLineForm from "./TsvLineForm";
function Editor({ingredient, setIngredient, currentRowN, setCurrentRowN, setIngredientValueChanged, setSaveIngredientTsv, ingredientValueChanged, saveIngredientTsv }) {
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
    const handleSaveRow = (rowN, newRow) => {
        const newIngredient = [...ingredient]
        newIngredient[rowN] = [...newRow]
        setIngredientValueChanged(true)
        setSaveIngredientTsv(true)
        setIngredient(newIngredient);
    };

    
    return <Box sx={{ display: 'flex', flexDirection:"column", gap: 2, padding: 2 }}>
            <TsvLineForm
                mode="edit"
                currentRow={currentRow}
                currentRowN={currentRowN}
                ingredient={ingredient}
                setIngredient={setIngredient}
                saveFunction={handleSaveRow}
                setSaveIngredientTsv={setSaveIngredientTsv}
            />
            </Box>;
}

export default Editor;
