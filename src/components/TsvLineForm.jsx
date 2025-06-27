import { Box, FormControl, TextField, Button } from "@mui/material";
import MarkdownField from "./MarkdownField";
import {useState, useContext, useEffect} from "react";
import {
    i18nContext as I18nContext,
    debugContext as DebugContext,
    bcvContext as BcvContext,
    getText,
    doI18n,
} from "pithekos-lib";

function TsvLineForm({ mode, currentRow, ingredient, saveFunction, }) {
    const { i18nRef } = useContext(I18nContext);
    const [rowData, setRowData] = useState(Array(7).fill("",0,6))
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
    };

    // Permet d'annuler les modications faites sur la note 
    const handleCancel = (rowN) => {
        const newRowData = (mode === "edit" ? [...currentRow] : columnNames.map(() => ""))
        setRowData(newRowData);

    };
    console.log("rowdata", rowData)
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
                            label={`${mode === "add" ? "Nouvelle " : ""}${column}`}
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
                {doI18n("pages:core-local-workspace:editing", i18nRef.current)}
            </Button>
            <Button onClick={() => handleCancel(rowData.n)} variant="contained" disabled={!cellValueChanged} sx={{
                mt: 2,
                backgroundColor: cellValueChanged ? 'primary' : 'grey.400',
                color: 'white',
            }}>{doI18n("pages:core-local-workspace:cancel", i18nRef.current)}</Button>
        </Box>

    )
}

export default TsvLineForm;