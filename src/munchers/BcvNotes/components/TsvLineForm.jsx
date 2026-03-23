import { useState, useContext, useEffect } from 'react';
import { Box, FormControl, TextField, Dialog, DialogTitle, DialogActions, DialogContent, Button, IconButton, Stack } from "@mui/material";
import MarkdownField from "../../../components/MarkdownField";
import ActionsButtons from "./ActionsButtons";
import AddLineDialog from "./AddLineDialog";
import DeleteNote from "./DeleteNote";
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { i18nContext as I18nContext } from "pankosmia-rcl";
import { doI18n } from "pithekos-lib";


function TsvLineForm({ 
    ingredient, 
    setIngredient, 
    currentRowN, 
    setCurrentRowN, 
    updateBcv, 
    mode, 
    currentRow, 
    setCurrentRow, 
    saveFunction, 
    cellValueChanged, 
    setCellValueChanged, 
    resourceType, 
    refDisabled,
    setRefDisabled
}) {
    
    const { i18nRef } = useContext(I18nContext);
    const columnNames = ingredient[0] || [];
    const [openRefDialog, setOpenRefDialog] = useState(false);
    const [tempRef, setTempRef] = useState("");

    const [openedModal, setOpenedModal] = useState(null);

    const isCreate = mode === "add"; 

    const refIndex = columnNames.findIndex(col => {
        const cleanCol = col.replace('\r', '').trim().toUpperCase();
        return ["REF", "REFERENCE"].includes(cleanCol);
    });

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
        const originalData = mode === "edit" 
            ? [...ingredient[currentRowN]] 
            : Array(columnNames.length).fill("");
        setCurrentRow(originalData);
        setCellValueChanged(false);
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

    const visibilityMap = {
        new_bcv_question: [...(isCreate ? ['ref', 'id', 'reference'] : []), 'question', 'response', 'quote', 'occurrence', 'occurence'],
        new_bcv_study_question: [...(isCreate ? ['ref', 'id', 'reference'] : []), 'question']
    };
    
    const activeColumns = visibilityMap[resourceType] || columnNames.map(c => c.replace('\r', '').trim().toLowerCase());

    useEffect(() => {
        let rowData;
        if (mode === "edit") {
            rowData = [...(ingredient[currentRowN] || [])];
        } else {
            rowData = Array(columnNames.length).fill("");

            if (refDisabled && refIndex !== -1) {
                rowData[refIndex] = ingredient[currentRowN]?.[refIndex] || "";
            }
        }
        setCurrentRow(rowData);
    }, [mode, refDisabled, currentRowN, ingredient]);

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
                        label={doI18n("pages:core-local-workspace:example_reference", i18nRef.current)}
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
            <AddLineDialog
                mode="add"
                open={openedModal === "add"}
                closeModal={() => { setOpenedModal(null); setRefDisabled(false) }}
                currentRowN={currentRowN}
                setCurrentRowN={setCurrentRowN}
                ingredient={ingredient}
                setIngredient={setIngredient}
                cellValueChanged={cellValueChanged}
                setCellValueChanged={setCellValueChanged}
                refDisabled={refDisabled}
                setRefDisabled={setRefDisabled}
            />
            <DeleteNote
                mode="delete"
                open={openedModal === "delete"}
                closeModal={() => setOpenedModal(null)}
                ingredient={ingredient}
                setIngredient={setIngredient}
                rowData={currentRow}
                currentRowN={currentRowN}
            />
            {activeColumns.map((column) => {

                const cleanColumn = column.trim().replace(/\r/g, '').toLowerCase();
                const realIndex = columnNames.findIndex(col => col.replace('\r', '').trim().toLowerCase() === cleanColumn.toLowerCase());
                const isRef = cleanColumn === "ref" || cleanColumn === "reference";
                const isId = cleanColumn.includes("id");
                const isRefOrId = ['ref', 'id', 'reference'].includes(cleanColumn.toLowerCase());

                if (realIndex === -1) return null;

                if (!isCreate && isRefOrId && !refDisabled) {
                    return null;  
                }

                if (openedModal !== "add" && !isCreate && ['ref', 'id', 'reference'].includes(cleanColumn)) {
                    return null;
                };

                const occIndex = columnNames.findIndex(col => {
                    const clean = col.replace('\r', '').trim().toLowerCase();
                    return clean === 'occurrence' || clean === 'occurence'; 
                });


                if (cleanColumn.toLowerCase() === 'quote' && !isCreate) {
                    return (
                        <Stack direction="row" spacing={2} alignItems="center" key="row-quote-occ" sx={{ mt: 2, mb: 1 }}>
                            <TextField 
                                label="Quote" 
                                value={currentRow[realIndex] || ''} 
                                onChange={(e) => changeCell(e, realIndex)}
                                fullWidth
                                size="small"
                            />
                            <TextField 
                                label="Occ" 
                                value={currentRow[occIndex] || ''} 
                                onChange={(e) => changeCell(e, occIndex)}
                                sx={{ width: '80px' }} 
                                size="small"
                            />
                            <Stack direction="row">
                                <IconButton size="small" onClick={() => { 
                                    setRefDisabled(true);
                                    setTimeout(() => {
                                      setOpenedModal("add"); 
                                    }, 0);
                                }}>
                                    <AddIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" onClick={() => setOpenedModal("delete") }>
                                    <RemoveIcon fontSize="small" />
                                </IconButton>
                            </Stack>
                        </Stack>
                    );
                }

                if (cleanColumn.toLowerCase() === 'occurrence') return null;
                const isLastNoteField = realIndex === 6;
                const rawName = isLastNoteField ? "Note" : (columnNames[realIndex] || cleanColumn).replace('\r', '').trim();
                const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();

                return (
                    <FormControl fullWidth margin="normal" key={cleanColumn + realIndex} >
                        {['note', 'question', 'response'].some(word => cleanColumn.toLowerCase().includes(word)) ? (
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
                                label={displayName}
                                value={currentRow[realIndex] || ''}
                                placeholder={(cleanColumn.includes("Reference") || cleanColumn.includes("REF")) ? "1:1" : ""}
                                required={cleanColumn.includes("Reference") || cleanColumn.includes("REF")}
                                disabled={
                                    isId || 
                                    (mode === "edit" && isRef) || 
                                    (refDisabled && isRef)
                                }
                                variant="outlined"
                                fullWidth
                                size="small"
                                onChange={(e) => { console.log(e); changeCell(e, realIndex) }}
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