import { Box, FormControl, TextField } from "@mui/material";
import MarkdownField from "./MarkdownField";

function LineForm({ mode, currentRow, ingredient, addCurrentRow, valeur, changeCell }) {
    const columnNames = ingredient[0] || [];

    return (
        <Box sx={{ padding: 1, justifyContent: "center" }}>
            {columnNames.map((column, n) => (
                <FormControl fullWidth margin="normal" key={n}>
                    {column === 'Note' ? (
                        <MarkdownField
                            currentRow={currentRow}
                            columnNames={columnNames}
                            onChangeNote={(e) => changeCell(e, n)}
                            addCurrentRow={addCurrentRow}
                            valeur={valeur}
                        />
                    ) : mode === "Add" ? (
                        <TextField
                            label={`Nouvelle ${column}`}
                            value={addCurrentRow.content[n]}
                            variant="outlined"
                            fullWidth
                            size="small"
                            onChange={(e) => changeCell(e, n)}
                        />

                    ) : (
                        <TextField
                            label={column}
                            value={currentRow.content[n]}
                            variant="outlined"
                            fullWidth
                            size="small"
                            onChange={(e) => changeCell(e, n)}
                        />
                    )}
                </FormControl>
            ))}
        </Box>

    )
}

export default LineForm;