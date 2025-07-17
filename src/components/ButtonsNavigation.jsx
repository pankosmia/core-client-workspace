import { useContext } from "react";
import { Box, Button } from "@mui/material";
import {
    i18nContext as I18nContext,
    doI18n,
} from "pithekos-lib";

function ButtonsNavigation({ ingredient, setIngredient, currentRowN, setCurrentRowN, updateBcv, rowData, setSaveIngredientTsv }) {

    const { i18nRef } = useContext(I18nContext);

    // Permet d'enregistrer les changements effectués dans les nots
    const handleSaveRow = (rowN, newRow) => {
        const newIngredient = [...ingredient]
        newIngredient[rowN] = [...newRow]
        setIngredient(newIngredient);
        //setSaveIngredientTsv(true)
    };

    // changer de page -1 
    const previousRow = () => {
        const newRowN = currentRowN - 1;
        if (newRowN >= 1 && ingredient.length > 1 && ingredient[newRowN]) {
            setCurrentRowN(newRowN);
            //updateBcv(newRowN);
        }
    };

    // changer de page +1 
    const nextRow = () => {
        const newRowN = currentRowN + 1;
        if (ingredient[newRowN]) {
            setCurrentRowN(newRowN);
            //updateBcv(newRowN);

        }
    };

    return (
        <Box sx={{ display: 'flex', gap: 2, padding: 1, justifyContent: "center" }}>
            <Button
                variant="contained"
                onClick={() => { previousRow(); handleSaveRow(currentRowN, rowData) }}
                sx={{
                    mt: 2,
                    "&.Mui-disabled": {
                        background: "#eaeaea",
                        color: "#424242"
                    }
                }}
            >
                {doI18n("pages:core-local-workspace:previous", i18nRef.current)}
            </Button>
            <Button
                onClick={() => { nextRow(); handleSaveRow(currentRowN, rowData) }} variant="contained"
                sx={{
                    mt: 2,
                    "&.Mui-disabled": {
                        background: "#eaeaea",
                        color: "#424242"
                    }
                }}
            >
                {doI18n("pages:core-local-workspace:next", i18nRef.current)}
            </Button>
        </Box>

    )
}

export default ButtonsNavigation;


