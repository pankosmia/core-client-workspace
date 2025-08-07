import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import TsvLineForm from "./TsvLineForm";
function Editor({ ingredient, setIngredient, currentRowN, setCurrentRowN, updateBcv, cellValueChanged, setCellValueChanged, currentRow,setCurrentRow}) {

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
    };


    return <Box sx={{ display: 'flex', flexDirection: "column", gap: 2, padding: 2 }}>
        <TsvLineForm
            mode="edit"
            currentRow={currentRow}
            setCurrentRow={setCurrentRow}

            saveFunction={handleSaveRow}
            updateBcv={updateBcv}

            currentRowN={currentRowN}
            setCurrentRowN={setCurrentRowN}

            ingredient={ingredient}
            setIngredient={setIngredient}

            cellValueChanged={cellValueChanged}
            setCellValueChanged={setCellValueChanged}
        />
    </Box>
}

export default Editor;
