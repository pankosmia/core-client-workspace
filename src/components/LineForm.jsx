import { Box, FormControl, TextField, Button } from "@mui/material";
import MarkdownField from "./MarkdownField";
import { useState } from "react";

function LineForm({ mode, currentRow, ingredient, saveFunction, }) {
    console.log("currentRow",currentRow, mode)
    console.log("ingredient",ingredient)
    const columnNames = ingredient[0] || [];
    const [rowData, setRowData] = useState(mode === "Edit" ? currentRow : { n: 99, content: columnNames.map((c) => "") })
    const [changeCellValue, setChangeCellValue] = useState(false);

    // Permet la modification d'une note
    const changeCell = (event, n) => {
        const newCellValue = event.target.value;
        const newRowData = {
            ...rowData,
            content: [...rowData.content]
        };
        newRowData.content[n] = newCellValue;
        setRowData(newRowData);
        setChangeCellValue(true);
    
    };

    // Permet d'annuler les modications faites sur la note 
    const handleCancel = (rowN) => {
        const newRowData = (mode === "Edit" ? currentRow : { n: 1, content: columnNames.map(() => "")})
        setRowData(newRowData);
        
    };
    console.log("rowdata",rowData)
    return (
        <Box sx={{ padding: 1, justifyContent: "center" }}>
            {columnNames.map((column, n) => (
                <FormControl fullWidth margin="normal" key={n}>
                    {column === 'Note' ? (
                        <MarkdownField
                            value={rowData.content[n]}
                            columnNames={columnNames}
                            onChangeNote={(e) => changeCell(e, n)}
                            mode={mode}
                        />
                    ) : (
                        <TextField
                            label={`${mode === "Add" ? "Nouvelle " : ""}${column}`}
                            value={rowData.content[n]}
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
                disabled={!changeCellValue}
                sx={{
                    mt: 2,
                    backgroundColor: changeCellValue ? 'primary' : 'grey.400',
                    color: 'white',
                }}
            >
                Ok
            </Button>
            <Button onClick={() => handleCancel(rowData.n)} variant="contained" disabled={!changeCellValue} sx={{
                mt: 2,
                backgroundColor: changeCellValue ? 'primary' : 'grey.400',
                color: 'white',
            }}>Annuler</Button>
        </Box>

    )
}

export default LineForm;