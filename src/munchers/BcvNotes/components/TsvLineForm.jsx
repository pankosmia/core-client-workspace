import { useState, useContext } from 'react';
import { Box, FormControl, TextField, Dialog, DialogTitle, DialogActions, DialogContent, Button } from "@mui/material";
import MarkdownField from "../../../components/MarkdownField";
import ActionsButtons from "./ActionsButtons";
import EditIcon from '@mui/icons-material/Edit';
import { i18nContext as I18nContext } from "pankosmia-rcl";
import { doI18n } from "pithekos-lib";


function TsvLineForm({ ingredient, setIngredient, currentRowN, setCurrentRowN, updateBcv, mode, currentRow, setCurrentRow, saveFunction, cellValueChanged, setCellValueChanged, resourceType, isCreate }) {
    
    const { i18nRef } = useContext(I18nContext);
    const columnNames = ingredient[0] || [];
    const [openRefDialog, setOpenRefDialog] = useState(false);
    const [tempRef, setTempRef] = useState("");

    const refIndex = columnNames.findIndex(col => col.replace('\r', '').trim() === "REF");

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


    const handleOpenRef = () => {
        setTempRef(currentRow[refIndex] || "");
        setOpenRefDialog(true);
    };

    const handleSaveRef = () => {
        const updatedRow = [...currentRow];
        updatedRow[refIndex] = tempRef;
    
        setCurrentRow(updatedRow);
    
        if (tempRef.length > 0 && /^[^:]+:[^:]+$/.test(tempRef)) {
            setCellValueChanged(true);
        } else {
            setCellValueChanged(false);
        }
    
        saveFunction(currentRowN, updatedRow); 
    
        setCellValueChanged(false); 
        setOpenRefDialog(false);
    };

    return (
        <Box sx={{ padding: 1, justifyContent: "center", height: "50%" }}>
            {
                !isCreate 
                &&
                <Button 
                    variant="text" 
                    size="small" 
                    startIcon={<EditIcon />} 
                    onClick={handleOpenRef}
                    sx={{ mb: 1, color: 'text.secondary' }}
                >
                    {doI18n("pages:core-local-workspace:reference", i18nRef.current)} {currentRow[refIndex] || doI18n("pages:core-local-workspace:no_reference", i18nRef.current)}
                </Button>
            }
            <Dialog open={openRefDialog} onClose={() => setOpenRefDialog(false)}>
                <DialogTitle>{doI18n("pages:core-local-workspace:edit_reference", i18nRef.current)}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Referencia (ej: 1:1)"
                        fullWidth
                        value={tempRef}
                        onChange={(e) => setTempRef(e.target.value)}
                        variant="standard"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRefDialog(false) }>{doI18n("pages:core-local-workspace:cancel", i18nRef.current)}</Button>
                    <Button onClick={handleSaveRef} variant="contained">{doI18n("pages:core-local-workspace:apply", i18nRef.current)}</Button>
                </DialogActions>
            </Dialog>
            {columnNames.map((column, n) => {

                const cleanColumn = column.replace('\r', '').trim();

                const visibilityMap = {
                    new_bcv_question: [...(isCreate ? ['REF', 'ID'] : []), 'Question', 'Response', 'Response'],
                    new_bcv_study_question: [...(isCreate ? ['REF', 'ID'] : []), 'Question', 'Question']
                };

                if (!isCreate && (cleanColumn === 'REF' || cleanColumn === 'ID')) {
                    return null;
                }

                // We filter, if the resourceType exists but the column isn't in the list, we don't render. IF the resourceType exists, we render everything.
                if (visibilityMap[resourceType] && !visibilityMap[resourceType].includes(cleanColumn)) {
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