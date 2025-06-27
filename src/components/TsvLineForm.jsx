import { Box, FormControl, TextField, Button } from "@mui/material";
import MarkdownField from "./MarkdownField";
import { useState } from "react";

function TsvLineForm({ mode, currentRow, ingredient, saveFunction, }) {
    console.log("currentRow",currentRow, mode)
    console.log("ingredient",ingredient)
    const columnNames = ingredient[0] || [];
    const [rowData, setRowData] = useState(mode === "Edit" ? [...currentRow] : columnNames.map((c) => ""))
    const [cellValueChanged, setCellValueChanged] = useState(false);

    // Permet la modification d'une note
    const changeCell = (event, n) => {
        const newCellValue = event.target.value;
        const newRowData = [...rowData];
        newRowData[n] = newCellValue;
        setRowData(newRowData);
        setCellValueChanged(true);
    };

    // Permet d'annuler les modications faites sur la note 
    const handleCancel = (rowN) => {
        const newRowData = (mode === "Edit" ? [...currentRow] : columnNames.map(() => ""))
        setRowData(newRowData);
        
    };
    console.log("rowdata",rowData)
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
                            label={`${mode === "Add" ? "Nouvelle " : ""}${column}`}
                            value={rowData[n]}
                            variant="outlined"
                            fullWidth
                            size="small"
                            onChange={(e) => changeCell(e, n)}
                        />
                    )}
                </FormControl>
            ))}
            <Button
                onClick={() => saveFunction(rowData.n)}
                variant="contained"
                disabled={!cellValueChanged}
                sx={{
                    mt: 2,
                    backgroundColor: cellValueChanged ? 'primary' : 'grey.400',
                    color: 'white',
                }}
            >
                Ok
            </Button>
            <Button onClick={() => handleCancel(rowData.n)} variant="contained" disabled={!cellValueChanged} sx={{
                mt: 2,
                backgroundColor: cellValueChanged ? 'primary' : 'grey.400',
                color: 'white',
            }}>Annuler</Button>
        </Box>

    )
}

export default TsvLineForm;