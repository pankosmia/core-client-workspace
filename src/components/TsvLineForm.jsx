import { Box, FormControl, TextField } from "@mui/material";
import MarkdownField from "./MarkdownField";
import ActionsButtons from "./ActionsButtons";

function TsvLineForm({ ingredient, setIngredient, currentRowN, setCurrentRowN, updateBcv, mode, currentRow, setCurrentRow, saveFunction, cellValueChanged, setCellValueChanged }) {
    const columnNames = ingredient[0] || [];

    // Permet la modification d'une note
    const changeCell = (event, n) => {
        const newCellValue = event.target.value;
        const newRowData = [...currentRow];
        newRowData[n] = newCellValue;
        if (newRowData[0].length > 0 && /^[^:]+:[^:]+$/.test(newRowData[0])) {
            setCellValueChanged(true)
        } else {
            setCellValueChanged(false)
        }
        setCurrentRow(newRowData);
    };

    // Permet d'annuler les modications faites sur la note 
    const handleCancel = () => {
        const newRowData = (mode === "edit" ? [...ingredient[currentRowN]] : Array(7).fill("", 0, 7))
        setCurrentRow(newRowData);
    };

    return (
        <Box sx={{ padding: 1, justifyContent: "center", height: "50%" }}>
            {columnNames.map((column, n) => (
                <FormControl fullWidth margin="normal" key={n} >
                    {['Note', 'Question', 'Response'].includes(column) ? (
                        <MarkdownField
                            value={currentRow[n]}
                            columnNames={columnNames}
                            onChangeNote={(e) => changeCell(e, n)}
                            fieldN={n}
                            ingredient={ingredient}
                            currentRowN={currentRowN}
                            mode={mode}

                        />
                    ) : (
                        <TextField
                            label={column}
                            value={currentRow[n]}
                            placeholder={n === 0 ? "1:1" : ""}
                            required={n === 0}
                            disabled={n === 1 || (mode === "edit" && ingredient[currentRowN] && ingredient[currentRowN].length === 1)}
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
                rowData={currentRow}
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