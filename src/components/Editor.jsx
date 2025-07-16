import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import TsvLineForm from "./TsvLineForm";
function Editor({ingredient, setIngredient, currentRowN, setIngredientValueChanged, setSaveIngredientTsv }) {
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
        setIngredient(newIngredient);
        setIngredientValueChanged(true)
        setSaveIngredientTsv(true)
    };


    return <Box sx={{ display: 'flex', flexDirection:"column", gap: 2, padding: 2 }}>
            <TsvLineForm
                mode="edit"
                currentRow={currentRow}
                currentRowN={currentRowN}
                ingredient={ingredient}
                setIngredient={setIngredient}
                handleSaveRow={handleSaveRow}
                setIngredientValueChanged={setIngredientValueChanged}
                setSaveIngredientTsv={setSaveIngredientTsv}
            />
            </Box>;
}

export default Editor;
