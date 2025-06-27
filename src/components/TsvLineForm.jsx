import { Box, FormControl, TextField, Button } from "@mui/material";
import MarkdownField from "./MarkdownField";
import { useState, useContext, useEffect } from "react";
import {
    i18nContext as I18nContext,
    doI18n,
} from "pithekos-lib";

function TsvLineForm({ mode, currentRow, ingredient, saveFunction, currentRowN, setIngredient, ingredientHasChanged, setIngredientHasChanged }) {
    const { i18nRef } = useContext(I18nContext);
    const [rowData, setRowData] = useState(Array(7).fill("", 0, 7))
    const [cellValueChanged, setCellValueChanged] = useState(false);
    const columnNames = ingredient[0] || [];

    useEffect(
        () => {
            if (mode === "edit" && ingredient.length > 0) {
                setRowData(currentRow);
            }
        },
        [ingredient, currentRow, mode]
    );


    // Permet la modification d'une note
    const changeCell = (event, n) => {
        const newCellValue = event.target.value;
        const newRowData = [...rowData];
        newRowData[n] = newCellValue;
        setRowData(newRowData);
        setCellValueChanged(true);
        setIngredientHasChanged(true);
    };

    // Permet d'annuler les modications faites sur la note 
    const handleCancel = () => {
        const newRowData = (mode === "edit" ? [...currentRow] : Array(7).fill("", 0, 7))
        setRowData(newRowData);

    };
    //console.log("rowdata", rowData)
    return (
        <Box sx={{ padding: 1, justifyContent: "center" }}>
            {columnNames.map((column, n) => (
                <FormControl fullWidth margin="normal" key={n}>
                    {column === 'Note' ? (
                        <MarkdownField
                            value={rowData[n]}
                            columnNames={columnNames}
                            onChangeNote={(e) => changeCell(e, n)}
                            mode={mode}
                        />
                    ) : (
                        <TextField
                            label={column}
                            value={rowData[n]}
                            variant="outlined"
                            fullWidth
                            size="small"
                            onChange={(e) => changeCell(e, n)}
                        />
                    )}
                </FormControl>
            ))}
            <Box sx={{display: 'flex', gap: 2, padding: 1, justifyContent: "center" }}>
                <Button
                    onClick={() => { saveFunction(currentRowN, rowData); setCellValueChanged(false) }}
                    variant="contained"
                    disabled={!cellValueChanged}
                    sx={{
                        mt: 2,
                        backgroundColor: cellValueChanged ? 'primary' : 'grey.400',
                        color: 'white',
                    }}
                >
                    {mode === "edit" ? `${doI18n("pages:core-local-workspace:editing", i18nRef.current)}` : `${doI18n("pages:core-local-workspace:add", i18nRef.current)}`}
                </Button>
                <Button onClick={() => { handleCancel(); setCellValueChanged(false) }} variant="contained" disabled={!cellValueChanged} sx={{
                    mt: 2,
                    backgroundColor: cellValueChanged ? 'primary' : 'grey.400',
                    color: 'white',
                }}>{doI18n("pages:core-local-workspace:cancel", i18nRef.current)}</Button>
            </Box>

        </Box>

    )
}

export default TsvLineForm;