import { Box, FormControl, TextField } from "@mui/material";
import MarkdownField from "./MarkdownField";
import { useState, useContext, useEffect } from "react";
import {
    i18nContext as I18nContext,
    doI18n,
} from "pithekos-lib";
import { v4 as uuidv4 } from 'uuid';
import ActionsButtons from "./ActionsButtons";


function TsvLineForm({ingredient, setIngredient, currentRowN, setCurrentRowN, updateBcv, mode, currentRow, saveFunction,  }) {
    const { i18nRef } = useContext(I18nContext);
    const [cellValueChanged, setCellValueChanged] = useState(false);
    const [rowData, setRowData] = useState(Array(7).fill("", 0, 7))
    const columnNames = ingredient[0] || [];
   

    useEffect(
        () => {
            if (mode === "edit" && ingredient.length > 0) {
                setRowData(currentRow);
            } else {
                const newRowData = [...rowData]
                newRowData[1] = generateId()
                setRowData(newRowData)
            }
        },
        [ingredient, currentRow, mode]
    );




    // Permet la modification d'une note
    const changeCell = (event, n) => {
        const newCellValue = event.target.value;
        const newRowData = [...rowData];
        newRowData[n] = newCellValue;
        if (newRowData[0].length > 0 && /^[^:]+:[^:]+$/.test(newRowData[0])) {
            setCellValueChanged(true)
        } else {
            setCellValueChanged(false)
        }
        setRowData(newRowData);
    };

    // Permet d'annuler les modications faites sur la note 
    const handleCancel = () => {
        const newRowData = (mode === "edit" ? [...currentRow] : Array(7).fill("", 0, 7))
        setRowData(newRowData);
    };

    const generateId = () => {
        let existingId = ingredient.map(l => l[1]);
        let myId = null;
        let found = false;
        while (!found) {
            myId = uuidv4().substring(0, 4)
            if (!existingId.includes(myId)) {
                found = true
            }
        }
        return myId
    }

    return (
        <Box sx={{ padding: 1, justifyContent: "center", height: "50%" }}>
            {columnNames.map((column, n) => (
                <FormControl fullWidth margin="normal" key={n} >
                    {['Note', 'Question', 'Response'].includes(column) ? (
                        <MarkdownField
                            value={rowData[n]}
                            columnNames={columnNames}
                            onChangeNote={(e) => changeCell(e, n)}
                            mode={mode}
                            fieldN={n}

                        />
                    ) : (
                        <TextField
                            label={column}
                            value={rowData[n]}
                            placeholder={n === 0 ? "1:1" : ""}
                            required={n === 0}
                            disabled={n === 1}
                            variant="outlined"
                            fullWidth
                            size="small"
                            onChange={(e) => changeCell(e, n)}
                        />
                    )}
                </FormControl>

            ))}
            <ActionsButtons
                updateBcv={updateBcv}
                rowData={rowData}
                saveFunction={saveFunction}
                handleCancel={handleCancel}
                mode={mode}

                ingredient={ingredient}
                setIngredient={setIngredient}

                currentRowN={currentRowN}
                setCurrentRowN={setCurrentRowN}

                cellValueChanged={cellValueChanged}
                setCellValueChanged={setCellValueChanged}
            />
        </Box>

    )
}

export default TsvLineForm;