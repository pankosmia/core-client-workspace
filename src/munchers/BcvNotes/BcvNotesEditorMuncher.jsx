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

function BcvNotesViewerMuncher({ metadata }) {
    const [ingredient, setIngredient] = useState([]);
    const { systemBcv, setSystemBcv } = useContext(BcvContext);
    const { debugRef } = useContext(DebugContext);
    const { i18nRef } = useContext(I18nContext);
    const [open, setOpen] = useState(false);
    const [stateButtonNote, setStateButtonNote] = useState('write');
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
    // const referenceNotes = ingredient
    //     .filter(l => l[0] === `${systemBcv.chapterNum}:${systemBcv.verseNum}`)
    //     .map(l => l[0]);
    // const referenceIdNotes = ingredient
    //     .filter(l => l[0] === `${systemBcv.chapterNum}:${systemBcv.verseNum}`)
    //     .map(l => l[1]);
    // const referenceTagsNotes = ingredient
    //     .filter(l => l[0] === `${systemBcv.chapterNum}:${systemBcv.verseNum}`)
    //     .map(l => l[2]);
    // const referenceSupportNotes = ingredient
    //     .filter(l => l[0] === `${systemBcv.chapterNum}:${systemBcv.verseNum}`)
    //     .map(l => l[3]);
    // const referenceQuoteNotes = ingredient
    //     .filter(l => l[0] === `${systemBcv.chapterNum}:${systemBcv.verseNum}`)
    //     .map(l => l[4]);
    // const referenceOccurrenceNotes = ingredient
    //     .filter(l => l[0] === `${systemBcv.chapterNum}:${systemBcv.verseNum}`)
    //     .map(l => l[5]);
    // const verseNotes = ingredient
    //     .filter(l => l[0] === `${systemBcv.chapterNum}:${systemBcv.verseNum}`)
    //     .map(l => l[6]);

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
    }, [ingredient, systemBcv]);

    const setContentChanged = nv => {
        console.log("setContentChanged", nv);
        _setContentChanged(nv);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "note") {
            setCurrentNote(value);
            setContentChanged(true);
        } else if (name === "reference") {
            setCurrentReference(value);
            setContentChanged(true);
            const [chapter, verse] = value.split(":").map(Number);
            if (!isNaN(chapter) && !isNaN(verse)) {
                setSystemBcv({
                    ...systemBcv,
                    chapterNum: chapter,
                    verseNum: verse
                });
                const newCurrentRow = ingredient.find(l => l[0] === value);
                if (newCurrentRow) {
                    setCurrentRow(newCurrentRow[1]);
                    setCurrentTags(newCurrentRow[2]);
                    setCurrentSupportReference(newCurrentRow[3]);
                    setCurrentQuote(newCurrentRow[4]);
                    setCurrentOccurrence(newCurrentRow[5]);
                    setCurrentNote(newCurrentRow[6]);
                }
            } else {
                console.warn("Référence invalide :", value);
            }
        }
    };

    const chapters = [systemBcv.chapterNum]
    const verses = currentChapter
        ? ingredient.filter(item => item[0].startsWith(`${currentChapter}:`))
        : [];


    useEffect(() => {
        if (systemBcv?.chapterNum && systemBcv?.verseNum) {
            const ref = `${systemBcv.chapterNum}:${systemBcv.verseNum}`;
            setCurrentChapter(systemBcv.chapterNum);
            setCurrentVerse(ref);
        }
    }, [systemBcv]);

    const handleSave = () => {
        console.log("Ligne actuelle modifiée :", currentRow);
    }
    const handlePage = (event, value) => {
        setPage(value);
        const row = ingredient[value - 1];
        if (row) {
            setCurrentReference(row[0] || "");
            setCurrentRow(row[1] || "");
            setCurrentTags(row[2] || "");
            setCurrentSupportReference(row[3] || "");
            setCurrentQuote(row[4] || "");
            setCurrentOccurrence(row[5] || "");
            setCurrentNote(row[6] || "");
        }
    };
    // const handleChangeSystemBcv = (reference,id) => {
    //     setCurrentVerse(reference);
    //     setContentChanged(true);

    //     const [chapter, verse] = reference.split(':').map(Number);

    //     if (!isNaN(chapter) && !isNaN(verse)) {
    //         setSystemBcv({
    //             ...systemBcv,
    //             chapterNum: chapter,
    //             verseNum: verse
    //         });

    //         const newCurrentRow = ingredient.find(l => l[0] === reference);
    //         if (newCurrentRow) {
    //             setCurrentRow(newCurrentRow[1]);
    //             setCurrentTags(newCurrentRow[2]);
    //             setCurrentSupportReference(newCurrentRow[3]);
    //             setCurrentQuote(newCurrentRow[4]);
    //             setCurrentOccurrence(newCurrentRow[5]);
    //             setCurrentNote(newCurrentRow[6]);
    //         }
    //     } else {
    //         console.warn("Référence invalide :", reference);
    //     }
    // };

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
            if (newCurrentRow) {
                
                    //setCurrentRow(newCurrentRow[1])
                    setCurrentRow(newCurrentRow[2]);
                    setCurrentTags(newCurrentRow[3]);
                    setCurrentSupportReference(newCurrentRow[4]);
                    setCurrentQuote(newCurrentRow[5]);
                    setCurrentOccurrence(newCurrentRow[6]);
                    setCurrentNote(newCurrentRow[7]);
                } else {
                    console.warn("L'ID trouvé ne correspond pas à l'ID passé pour la référence :", reference, "ID passé:", id);
                }
        } else {
            console.warn("Référence invalide :", reference);
        }
        console.log("L'ID trouvé ne correspond pas à l'ID passé pour la référence :", reference, "ID passé:", id);
    };

    const Search = styled('div')(({ theme }) => ({
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: alpha(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.25),
        },
        marginRight: theme.spacing(2),
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(3),
            width: 'auto',
        },
    }));

    const SearchIconWrapper = styled('div')(({ theme }) => ({
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }));

    const StyledInputBase = styled(InputBase)(({ theme }) => ({
        color: 'inherit',
        '& .MuiInputBase-input': {
            padding: theme.spacing(1, 1, 1, 0),
            paddingLeft: `calc(1em + ${theme.spacing(4)})`,
            transition: theme.transitions.create('width'),
            width: '100%',
            [theme.breakpoints.up('md')]: {
                width: '20ch',
            },
        },
    }));

    return (
        <Box sx={{
            minHeight: '100vh',
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
        }}
        >
            {/* <h5>{`${metadata.name} (${systemBcv.bookCode} ${systemBcv.chapterNum}:${systemBcv.verseNum})`}</h5>
            <h6>{doI18n("munchers:bcv_notes_viewer:title", i18nRef.current)}</h6>
            <div>
                {ingredient &&
                    <Markdown>{
                        verseNotes.length > 0 ? verseNotes.join("\n***\n") : "No notes found for this verse"}
                    </Markdown>}
            </div> */}

            <Box display="flex"
                justifyContent="center"
                alignItems="center"
                width="100%"
                gap={2}
                padding={2}>
                <Search>
                    <SearchIconWrapper>
                        <SearchIcon />
                    </SearchIconWrapper>
                    <StyledInputBase
                        placeholder="Search notes ...."
                        inputProps={{ 'aria-label': 'search' }}
                        border="#FFF"
                    />
                </Search>
                <ToggleButtonGroup
                    exclusive
                    aria-label="Platform"
                    size="small"
                    value={value}
                    onChange={(event, newValue) => {
                        if (newValue !== null) {
                            setValue(newValue);
                        }
                    }}
                >
                    <ToggleButton value="book">Book</ToggleButton>
                    <ToggleButton value="chapter">Chapter</ToggleButton>
                </ToggleButtonGroup>
            </Box>
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


                <CardContent sx={{ flex: 2 }}>
                    <Paper sx={{ padding: 2 }}>
                        <TextField fullWidth label="Reference" margin="normal" name="reference" onChange={handleChange} value={currentReference} />
                        <TextField fullWidth label="Id" margin="normal" value={currentRow} />
                        <TextField fullWidth label="Tags" margin="normal" value={currentTags} />
                        <TextField fullWidth label="Support Reference" margin="normal" value={currentSupportReference} />
                        <TextField fullWidth label="Quote" margin="normal" value={currentQuote} />
                        <TextField fullWidth label="Occurence" margin="normal" value={currentOccurrence} />

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <FormLabel>Note</FormLabel>

                            <ToggleButtonGroup
                                exclusive
                                aria-label="Platform"
                                size="small"
                                value={value}
                                onChange={(event, newValue) => {
                                    if (newValue !== null) {
                                        setValue(newValue);
                                    }
                                }}
                            >
                                <ToggleButton value='write' onClick={() => setStateButtonNote('write')}><CreateIcon /></ToggleButton>
                                <ToggleButton value='preview' onClick={() => setStateButtonNote('preview')}><RemoveRedEyeIcon /></ToggleButton>
                            </ToggleButtonGroup>
                        </div>


                        {stateButtonNote === 'write' ? (
                            <FormControl fullWidth margin="normal">
                                <TextareaAutosize
                                    minRows={4}
                                    name="note"
                                    value={currentNote}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        maxHeight: '300px',
                                        padding: '16.5px 14px',
                                        borderRadius: 4,
                                        border: '1px solid rgba(0, 0, 0, 0.23)',
                                        fontFamily: 'Roboto, sans-serif',
                                        fontSize: '16px',
                                        lineHeight: '1.5',
                                        resize: 'vertical',
                                        boxSizing: 'border-box',
                                    }}

                                />
                            </FormControl>
                        ) : (
                            <Markdown>{
                                currentNote.length > 0
                                    ? currentNote
                                    : "No notes found for this verse"}
                            </Markdown>
                        )}
                        <Button onClick={handleSave} variant="contained" sx={{ mt: 2 }}>Modifier</Button>
                    </Paper>
                    <Pagination
                        count={ingredient.length}
                        page={page}
                        onChange={handlePage}
                        size="small"
                        variant="outlined"
                        shape="rounded"
                    />
                </CardContent>
            </Box>
        </Box >

    );
}

export default BcvNotesViewerMuncher;
