import { useState, useContext, useEffect, useMemo } from 'react';
import { Box, FormControl, TextField, Dialog, DialogTitle, DialogActions, DialogContent, Button, IconButton, Stack } from "@mui/material";
import MarkdownField from "../../../components/MarkdownField";
import ActionsButtons from "./ActionsButtons";
import EditIcon from '@mui/icons-material/Edit';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
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

    const isCreate = mode === "add"; 
    const quoteIndex = columnNames.findIndex(c => c.toLowerCase().includes('quote'));
    const refIndex = columnNames.findIndex(col => {
        const cleanCol = col.replace('\r', '').trim().toLowerCase();
        return ["ref", "reference"].includes(cleanCol);
    });
    const occIndex = columnNames.findIndex(col => {
        const c = col.trim().toLowerCase().replace('\r', '');
        return c === 'occurrence' || c === 'occurence';
    });

    const isNoteResource = () => {
        return !(ingredient[0].some(c => c.includes('Response')) || ingredient[0].some(c => c.includes('Question')));
    };

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
        new_bcv_question: [...(isCreate ? ['ref', 'id', 'reference'] : []), 'question', 'response'],
        new_bcv_study_question: [...(isCreate ? ['ref', 'id', 'reference'] : []), 'question']
    };
    
    const activeColumns = visibilityMap[resourceType] || columnNames.map(c => c.replace('\r', '').trim().toLowerCase());

    const totalNotesInRef = useMemo(() => {
        const currentRef = currentRow[refIndex]?.replace('\r', '').trim();
        if (!currentRef || !ingredient) return 1;
    
        const getBaseRef = (ref) => ref.split('-')[0].trim();
        const currentBase = getBaseRef(currentRef);
    
        const existingMatches = ingredient.slice(1).filter(row => {
            const rowRef = row[refIndex]?.replace('\r', '').trim();
            if (!rowRef) return false;
            
            return getBaseRef(rowRef) === currentBase;
        });
    
        return mode === "add" ? existingMatches.length + 1 : existingMatches.length;
    
    }, [ingredient, currentRow[refIndex], mode, refIndex]);
    
    const suggestedOrder = useMemo(() => {
        const currentRef = currentRow[refIndex]?.replace('\r', '').trim();
        if (!currentRef || !ingredient) return "1";
    
        const getBaseRef = (ref) => ref.split('-')[0].trim();
        const currentBase = getBaseRef(currentRef);
    
        const matchesCount = ingredient.slice(1, (mode === "edit" ? currentRowN + 1 : undefined)).filter(row => {
            const rowRef = row[refIndex]?.replace('\r', '').trim();
            return rowRef && getBaseRef(rowRef) === currentBase;
        }).length;
    
        const order = mode === "add" ? (matchesCount + 1) : matchesCount;
        return (order || 1).toString();
    }, [ingredient, currentRow[refIndex], mode, currentRowN, refIndex]);

    const handleNudge = (amount, targetIndex) => {
        if (targetIndex === -1) return;
    
        const currentVal = parseInt(currentRow[targetIndex]) || parseInt(suggestedOrder) || 1;
        
        const newVal = Math.max(1, Math.min(currentVal + amount, totalNotesInRef));
    
        if (newVal.toString() !== (currentRow[targetIndex] || "").toString()) {
            const newRowData = [...currentRow];
            newRowData[targetIndex] = newVal.toString();
            setCurrentRow(newRowData);
            setCellValueChanged(true);
        }
    };

    useEffect(() => {
        if (!ingredient || currentRowN === -1) return;

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
        setCellValueChanged(false);
    
    }, [currentRowN, mode, refDisabled, ingredient]); 

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
                        onChange={(e) => {
                            const cleanRef = e.target.value.replace(/\s/g, '');
                            setTempRef(cleanRef)
                        }}
                        variant="standard"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRefDialog(false) }>{doI18n("pages:core-local-workspace:cancel", i18nRef.current)}</Button>
                    <Button onClick={handleSaveRef} variant="contained">{doI18n("pages:core-local-workspace:apply", i18nRef.current)}</Button>
                </DialogActions>
            </Dialog>
            {activeColumns.map((column) => {

                const cleanColumn = column.trim().replace(/\r/g, '').toLowerCase();
                const isRef = cleanColumn === "ref" || cleanColumn === "reference";
                const isId = cleanColumn.includes("id");
                const isRefOrId = ['ref', 'id', 'reference'].includes(cleanColumn.toLowerCase());
                const realIndex = columnNames.findIndex(col => col.replace('\r', '').trim().toLowerCase() === cleanColumn.toLowerCase());
                const isLastNoteField = realIndex === 6;
                const rawName = isLastNoteField ? "Note" : (columnNames[realIndex] || cleanColumn).replace('\r', '').trim();
                const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();

                if (realIndex === -1) return null;

                if (!isCreate && isRefOrId && !refDisabled) {
                    return null;  
                }

                if (cleanColumn === 'quote' && isNoteResource()) {
                    return (
                        <Stack direction="row" spacing={1} alignItems="flex-end" key="snippet-row" sx={{ pt: 1, mb: 2 }}>
                            <TextField 
                                label="Quote"
                                value={currentRow[quoteIndex] || ''} 
                                onChange={(e) => changeCell(e, quoteIndex)}
                                fullWidth
                                size="small"
                            />
                            <Stack direction="row" alignItems="center" spacing={0} sx={{ width: "25%" }}>
                                <TextField
                                    fullWidth
                                    label="Occurrence"
                                    value={currentRow[occIndex] || ''}
                                    placeholder={suggestedOrder}
                                    size="small"
                                    onFocus={() => {
                                        if (!currentRow[occIndex]) {
                                            const newRow = [...currentRow];
                                            newRow[occIndex] = suggestedOrder;
                                            setCurrentRow(newRow);
                                            setCellValueChanged(true);
                                        }
                                    }}
                                    slotProps={{
                                        input: {
                                            readOnly: true,
                                            sx: { textAlign: 'center', fontWeight: 'bold' },
                                            endAdornment: (
                                                <Stack direction="column" sx={{ mr: -0.5 }}> 
                                                    <IconButton size="small" onClick={() => handleNudge(1, occIndex)} sx={{ p: 0, height: 15 }}>
                                                        <ArrowDropUpIcon fontSize="inherit" />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => handleNudge(-1, occIndex)} sx={{ p: 0, height: 15 }}>
                                                        <ArrowDropDownIcon fontSize="inherit" />
                                                    </IconButton>
                                                </Stack>
                                            )
                                        }
                                    }}
                                />
                            </Stack>
                            <TextField 
                                fullWidth
                                label="Total" 
                                value={totalNotesInRef}
                                size="small" 
                                sx={{ width: '13%' }} 
                                slotProps={{ input: { readOnly: true } }} 
                            />
                        </Stack>
                    );
                }

                if (cleanColumn === 'occurrence' || cleanColumn === 'occurence') {
                    return null;
                }
                
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
                                onChange={(e) => { changeCell(e, realIndex) }}
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