import { useEffect, useState, Fragment } from 'react';
import {  ListItemButton, ListItemText, Box, Stack, List, Collapse, Typography, Button } from "@mui/material";
import AddFab from "./AddFab";
import AddLineDialog from './AddLineDialog';
import { ExpandLess, ExpandMore, Add } from '@mui/icons-material';

function SearchWithVerses({ ingredient, setIngredient, setCurrentRowN, currentRowN,cellValueChanged, setCellValueChanged, updateBcv, currentChapter, refDisabled, setRefDisabled }) {

    const [openVerses, setOpenVerses] = useState({});
    const [openedModal, setOpenedModal] = useState(null);

    const groupedVerses = currentChapter ? ingredient.reduce((acc, item) => {
        const reference = item[0];
        if (reference.startsWith(`${currentChapter}:`)) {
            const vNum = reference.split(':')[1].split('-')[0];
            if (!acc[vNum]) acc[vNum] = [];
            if (!acc[vNum].find(n => n[1] === item[1])) {
                acc[vNum].push(item);
            }
        }
        return acc;
    }, {}) : {};

    const sortedVerseKeys = Object.keys(groupedVerses).sort((a, b) => parseInt(a) - parseInt(b));

    const handleSelectNote = (id) => {
        const index = ingredient.findIndex(l => l[1] === id);
        if (index !== -1) {
            setCurrentRowN(index);
            updateBcv(index);
        }
    };

    const toggleVerse = (vNum, firstNoteId) => {
        setOpenVerses(prev => {
            const isOpening = !prev[vNum];
            if (isOpening) handleSelectNote(firstNoteId);
            return { ...prev, [vNum]: isOpening };
        });
    };

    const isNoteResource = () => {
        return ingredient[0].some(c => c.includes('Response')) || ingredient[0].some(c => c.includes('Question'));
    };

    useEffect(() => {
        if (sortedVerseKeys.length > 0) {
            const firstVerseKey = sortedVerseKeys[0];
            const firstNoteId = groupedVerses[firstVerseKey][0][1];
            handleSelectNote(firstNoteId);
        }
    }, [currentChapter]);

    return (
        <Stack spacing={2} sx={{ width: '200px', minWidth: '100px', maxWidth: '100%', overflow: 'hidden' }}>
            <AddFab
                currentRowN={currentRowN}
                setCurrentRowN={setCurrentRowN}
                ingredient={ingredient}
                setIngredient={setIngredient}
                cellValueChanged={cellValueChanged}
                setCellValueChanged={setCellValueChanged}
                refDisabled={refDisabled}
                setRefDisabled={setRefDisabled}
            />
            <Box sx={{ maxHeight: "75vh", overflowY: "auto", overflowX: "hidden", width: '100%', pr: 1 }}>
                <List component="nav">
                    {sortedVerseKeys.map((vNum) => {
                        const notes = groupedVerses[vNum];
                        const isMultiple = notes.length > 1;
                        const isOpen = openVerses[vNum];
                        const isSelected = notes.some(n => 
                            ingredient[currentRowN] && n[1] === ingredient[currentRowN][1]
                        );

                        return (
                            <Fragment key={vNum}>
                                <ListItemButton onClick={() => isMultiple ? toggleVerse(vNum, notes[0][1]) : handleSelectNote(notes[0][1])}>
                                    <ListItemText 
                                        primary={`v${vNum} ${isMultiple ? `(${notes.length})` : ""}`} 
                                        slotProps={{
                                            primary: {
                                                sx: { fontWeight: isSelected ? "bold" : "normal" }
                                            }
                                        }}
                                    />
                                    {isMultiple && (isOpen ? <ExpandLess /> : <ExpandMore />)}
                                </ListItemButton>
                                {isMultiple && (
                                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            {notes.map((note, n) => (
                                                <>
                                                    <ListItemButton 
                                                        key={note[1]} 
                                                        sx={{ pl: 2 }} 
                                                        onClick={() => { console.log(note); handleSelectNote(note[1])} }
                                                        selected={ingredient[currentRowN] && ingredient[currentRowN][1] === note[1]}
                                                    >
                                                        <ListItemText 
                                                            primary={
                                                                <Box 
                                                                    sx={{ 
                                                                        display: 'flex', 
                                                                        flexDirection: 'column', 
                                                                        alignItems: 'center',
                                                                        width: '100%'
                                                                    }}
                                                                >
                                                                    <Typography>
                                                                        {(note[4]?.length > 0 && isNoteResource()) ? note[4] : note[0]}
                                                                    </Typography>
                                                                    <Typography 
                                                                        variant="caption" 
                                                                        sx={{ 
                                                                            color: 'text.secondary', 
                                                                            fontSize: '0.75rem',
                                                                            whiteSpace: 'nowrap',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis'
                                                                        }}
                                                                    >
                                                                        {note[1]}
                                                                    </Typography>
                                                                </Box>
                                                        }/>
                                                    </ListItemButton>
                                                    {(n === notes.length - 1) 
                                                        && 
                                                        <Box 
                                                            sx={{ 
                                                                display: 'flex', 
                                                                flexDirection: 'column', 
                                                                alignItems: 'center',
                                                                width: '100%'
                                                            }}
                                                        >
                                                            <ListItemButton 
                                                                key={n+1} 
                                                                sx={{ pl: 2 }} 
                                                                onClick={() => { setRefDisabled(true); setOpenedModal("add") }}
                                                            >
                                                                <Add aria-label="@New note" />
                                                            </ListItemButton>
                                                        </Box>
                                                    }
                                                </>
                                            ))}
                                        </List>
                                    </Collapse>
                                )}
                            </Fragment>
                        );
                    })}
                </List>
            </Box>
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
        </Stack>
    );
}

export default SearchWithVerses;
