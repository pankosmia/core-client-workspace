import { Box, FormControl, TextField } from "@mui/material";
import MarkdownField from "../../../components/MarkdownField";
import ActionsButtons from "./ActionsButtons";

function TsvLineForm({ ingredient, setIngredient, currentRowN, setCurrentRowN, updateBcv, mode, currentRow, setCurrentRow, saveFunction, cellValueChanged, setCellValueChanged, resourceType }) {
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
        const newRowData = (mode === "edit" ? [...currentRow] : Array(7).fill("", 0, 7))
        setCurrentRow(newRowData);
    };

    return (
        <Box sx={{ padding: 1, justifyContent: "center", height: "50%" }}>
            {columnNames.map((column, n) => {

                const visibilityMap = {
                    new_bcv_question: ['Reference', 'ID', 'Question', 'Response\r', 'Response'],
                    new_bcv_study_question: ['Reference', 'ID', 'Question\r', 'Question']
                };

                // We filter, if the resourceType exists but the column isn't in the list, we don't render. IF the resourceType exists, we render everything.
                if (visibilityMap[resourceType] && !visibilityMap[resourceType].includes(column)) {
                    return null;
                }

                // Make sure we get the right index
                const realIndex = columnNames.indexOf(column);

                return (
                    <FormControl fullWidth margin="normal" key={column + realIndex} >
                        {['Note', 'Question', 'Response'].some(word => column.includes(word)) ? (
                            <MarkdownField
                                value={currentRow[realIndex]}
                                columnNames={columnNames}
                                onChangeNote={(e) => changeCell(e, realIndex)}
                                fieldN={realIndex}
                                ingredient={ingredient}
                                currentRowN={currentRowN}
                                mode={mode}
                            />
                        ) : (
                            <TextField
                                label={column.replace('\r', '')}
                                value={currentRow[realIndex] || ''}
                                placeholder={column.includes("Reference") ? "1:1" : ""}
                                required={column.includes("Reference")}
                                disabled={column.includes("ID") || (mode === "edit" && ingredient[currentRowN]?.length === 1)}
                                variant="outlined"
                                fullWidth
                                size="small"
                                onChange={(e) => changeCell(e, realIndex)}
                            />
                        )}
                    </FormControl>
                );
            })}
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