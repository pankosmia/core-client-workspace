import { useEffect, useState, useContext } from "react";
import { Box, Paper, TextField, Button, ToggleButton, Pagination, ToggleButtonGroup, CardContent, ListSubheader, TextareaAutosize, List, ListItemButton, ListItemIcon, ListItemText, Collapse, FormControl, FormLabel } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material"
import Markdown from 'react-markdown';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import CreateIcon from '@mui/icons-material/Create';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import SearchIcon from '@mui/icons-material/Search';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import {
    i18nContext as I18nContext,
    debugContext as DebugContext,
    bcvContext as BcvContext,
    doI18n,
    getText
} from "pithekos-lib";
import BcvNotesViewerMuncher from "../munchers/BcvNotes/BcvNotesEditorMuncher";

function SearchWithVerses({ metadata }) {
    const [ingredient, setIngredient] = useState([]);
    const { systemBcv, setSystemBcv } = useContext(BcvContext);
    const { debugRef } = useContext(DebugContext);
    const { i18nRef } = useContext(I18nContext);
    const [open, setOpen] = useState(false);
    const [currentRow, setCurrentRow] = useState('');
    const [currentNote, setCurrentNote] = useState('');
    const [currentReference, setCurrentReference] = useState('');
    const [currentTags, setCurrentTags] = useState('');
    const [currentSupportReference, setCurrentSupportReference] = useState('');
    const [currentQuote, setCurrentQuote] = useState('');
    const [currentOccurrence, setCurrentOccurrence] = useState('');
    const [currentChapter, setCurrentChapter] = useState('');
    const [currentVerse, setCurrentVerse] = useState('');
    const [value, setValue] = useState('');
    const [contentChanged, _setContentChanged] = useState(false);
    const [page, setPage] = useState(4)

    const getAllData = async () => {
        const ingredientLink = `/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.tsv`;
        let response = await getText(ingredientLink, debugRef.current);
        if (response.ok) {
            setIngredient(
                response.text
                    .split("\n")
                    .map(l => l.split("\t").map(f => f.replace(/\\n/g, "\n\n")))
            );
        } else {
            setIngredient([])
        }
    };
    useEffect(
        () => {
            getAllData().then();
        },
        [systemBcv]
    );

    const handleClick = () => {
        setOpen(!open);
    };

    useEffect(() => {
        const newCurrentRow = ingredient.find(
            l => l[0] === `${systemBcv.chapterNum}:${systemBcv.verseNum}`
        );
        if (newCurrentRow) {
            setCurrentReference(newCurrentRow[0])
            setCurrentRow(newCurrentRow[1]);
            setCurrentTags(newCurrentRow[2]);
            setCurrentSupportReference(newCurrentRow[3]);
            setCurrentQuote(newCurrentRow[4]);
            setCurrentOccurrence(newCurrentRow[5]);
            setCurrentNote(newCurrentRow[6]);
        }
        console.log("test de presence ")
    }, [ingredient, systemBcv]);


    const setContentChanged = nv => {
        console.log("setContentChanged", nv);
        _setContentChanged(nv);
    }


    const chapters = [systemBcv.chapterNum]
    const verses = currentChapter
        ? ingredient.filter(item => item[0].startsWith(`${currentChapter}:`))
        : [];


    const handleChangeSystemBcv = (reference, id) => {
        setCurrentVerse(reference);
        setContentChanged(true);

        const [chapter, verse] = reference.split(':').map(Number);

        if (!isNaN(chapter) && !isNaN(verse)) {
            setSystemBcv({
                ...systemBcv,
                chapterNum: chapter,
                verseNum: verse
            });

            const newCurrentRow = ingredient.find(l => l[0] === reference && l[1] === id);
            console.log("newcurrentrow",newCurrentRow)

            if (newCurrentRow) {
                    setCurrentReference(newCurrentRow[0])
                    setCurrentRow(newCurrentRow[1])
                    setCurrentTags(newCurrentRow[2]);
                    setCurrentSupportReference(newCurrentRow[3]);
                    setCurrentQuote(newCurrentRow[4]);
                    setCurrentOccurrence(newCurrentRow[5]);
                    setCurrentNote(newCurrentRow[6]);
                } else {
                    console.warn("L'ID trouvé ne correspond pas à l'ID passé pour la référence 1 :", reference, "ID passé:", id);
                }
        } else {
            console.warn("Référence invalide :", reference);
        }
    };


    return (
        <Box sx={{
            minHeight: '100vh',
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
        }}
        >
            <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, padding: 2 }}>
                <List>
                    <ListItemButton onClick={handleClick}>
                        <ListItemIcon>
                            <AutoStoriesIcon />
                        </ListItemIcon>
                        <ListItemText primary="Chapter" />
                        {open ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>

                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {chapters.map(chap => (
                                <>
                                    <ListItemButton
                                        key={chap}
                                        sx={{ pl: 4 }}
                                        selected={chap === currentChapter}
                                        onClick={() => {
                                            setCurrentChapter(chap);
                                            setCurrentVerse(null);
                                        }}
                                    >
                                        <ListItemText primary={`Chapitre ${chap}`} />
                                    </ListItemButton>

                                    {chap === currentChapter && (
                                        <Collapse in timeout="auto" unmountOnExit>
                                            <List component="div" disablePadding>
                                                {verses.map(v => (
                                                    <ListItemButton
                                                        key={v[0]}
                                                        sx={{
                                                            maxHeight: '50px',
                                                            overflowY: 'auto',
                                                            pl: 8,
                                                        }}
                                                        selected={v[0] === currentVerse}
                                                        onClick={() => handleChangeSystemBcv(v[0], v[1])}
                                                    >
                                                        <ListItemText primary={`Verset ${v[0].split(':')[1]} - ${v[1]}`} />
                                                    </ListItemButton>
                                                ))}

                                            </List>
                                        </Collapse>
                                    )}
                                </>
                            ))}
                        </List>
                    </Collapse>
                </List>
            </Box>
        </Box >

    );
}

export default SearchWithVerses;
