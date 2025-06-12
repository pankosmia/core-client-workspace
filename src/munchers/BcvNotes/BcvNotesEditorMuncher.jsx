import { useEffect, useState, useContext } from "react";
import './BcvNotesMuncher.css'
import { Box, Paper, TextField, Button, ToggleButton, Pagination, ToggleButtonGroup, CardContent, TextareaAutosize, List, ListItemButton, ListItemIcon, ListItemText, Collapse, FormControl, FormLabel } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material"
import Markdown from 'react-markdown';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import CreateIcon from '@mui/icons-material/Create';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import {
    i18nContext as I18nContext,
    debugContext as DebugContext,
    bcvContext as BcvContext,
    doI18n,
    getText
} from "pithekos-lib";
import SearchNavBar from "../../components/searchNavBar";
import { enqueueSnackbar } from "notistack";

async function postText(url, body, debug = false, contentType = "multipart/form-data") {
    try {
        const response = await fetch(
            url,
            {
                method: "POST",
                headers: { "Content-Type": contentType },
                body
            });
        if (!response.ok) {
            const result = {
                url,
                ok: false,
                status: response.status,
                error: await response.text
            };
            if (debug) {
                console.log("postText", result);
            }
            return result;
        }
        const result = {
            url,
            ok: true,
            status: response.status,
            json: await response.json()
        };
        if (debug) {
            console.log("postText", result);
        }
        return result;
    } catch (err) {
        const result = {
            url,
            ok: false,
            status: 0,
            error: err.message
        };
        if (debug) {
            console.log("postText", result);
        }
        return result;
    }
}

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
    const [currentVerse, setCurrentVerse] = useState({ reference: '', id: '' });
    const [value, setValue] = useState('');
    const [contentChanged, _setContentChanged] = useState(false);
    const [page, setPage] = useState(4)

    console.log("current verse", currentVerse)
    // Récupération des données du tsv
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
    // utilisation de la fonction getAllData
    useEffect(
        () => {
            getAllData().then();
        },
        [systemBcv]
    );

    // Inialisation des données au départ 
    useEffect(() => {
        if (
            currentVerse.reference === "" &&
            currentVerse.id === ""
        ) {
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
        }



    }, [ingredient, systemBcv]);

    // permet d'ouvrir et fermer le menu des chapitres
    const handleClick = () => {
        setOpen(!open);
    };

    // Montre le changement d'état du contenu 
    const setContentChanged = nv => {
        console.log("setContentChanged", nv);
        _setContentChanged(nv);
    }

    // Permet d'afficher tous les versets selon un chapitre selectionné 
    const chapters = [systemBcv.chapterNum]
    const verses = currentChapter
        ? ingredient.filter(item => item[0].startsWith(`${currentChapter}:`))
        : [];

    // Permet le changement des données en fonction du changement de la page
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

    // Change les données selon si on choisit le verset ou si on écrit manuellement la référence 
    const handleChangeVerse = (reference, id = null) => {
        setCurrentVerse({ reference, id });
        setContentChanged(true);
        const [chapter, verse] = reference.split(':').map(Number);

        if (!isNaN(chapter) && !isNaN(verse)) {
            setSystemBcv({
                ...systemBcv,
                chapterNum: chapter,
                verseNum: verse,
            });

            let newCurrentRow;
            if (id !== null) {
                newCurrentRow = ingredient.find(l => l[0] === reference && l[1] === id);
            } else {
                newCurrentRow = ingredient.find(l => l[0] === reference);
            }

            if (newCurrentRow) {
                setCurrentReference(newCurrentRow[0]);
                setCurrentRow(newCurrentRow[1]);
                setCurrentTags(newCurrentRow[2]);
                setCurrentSupportReference(newCurrentRow[3]);
                setCurrentQuote(newCurrentRow[4]);
                setCurrentOccurrence(newCurrentRow[5]);
                setCurrentNote(newCurrentRow[6]);

                if (id === null) {
                    setCurrentVerse({ reference, id: newCurrentRow[1] });
                }
            } else {
                console.warn("Référence ou ID non trouvée :", reference, id);
            }
        } else {
            console.warn("Référence invalide :", reference);
        }
    };

    const handleChangeSystemBcv = (reference, id) => {
        handleChangeVerse(reference, id);
    };

    // Permet une modification des notes ou de la reference
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "note") {
            setCurrentNote(value);
            setContentChanged(true);
        } else if (name === "reference") {
            setCurrentReference(value);
            setContentChanged(true);
            handleChangeVerse(value);
        }
    };

    const uploadTsvIngredient = async (tsvData, debugBool) => {
        const payload = "toto"
        const response = await postText(
            `/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.tsv`,
            payload,
            debugBool
        );
        if (response.ok) {
            enqueueSnackbar(
                `${doI18n("pages:core-local-workspace:saved", i18nRef.current)}`,
                { variant: "success" }
            );
            setContentChanged(false);
        } else {
            enqueueSnackbar(
                `${doI18n("pages:core-local-workspace:save_error", i18nRef.current)}: ${response.status}`,
                { variant: "error" }
            );
            throw new Error(`Failed to save: ${response.status}, ${response.error}`);
        }
    }
    // Permet de sauvegarder les changements apportées dans les notes 
    const handleSave = () => {
        if (currentNote.length > 0) {
            uploadTsvIngredient(currentNote)
        }
    }
    return (
        <Box sx={{
            minHeight: '100vh',
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
        }}
        >
            <SearchNavBar />
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
                        <List component="div" disablePadding >
                            {chapters.map(chap => (
                                <>
                                    <ListItemButton
                                        key={chap}
                                        sx={{ pl: 4 }}
                                        selected={chap === currentChapter}
                                        onClick={() => {
                                            setCurrentChapter(chap);
                                        }}
                                    >
                                        <ListItemText primary={`Chapitre ${chap}`} />
                                    </ListItemButton>

                                    {chap === currentChapter && (
                                        <Collapse in timeout="auto" unmountOnExit>
                                            <List component="div" disablePadding sx={{
                                                maxHeight: '800px',
                                                overflowY: 'auto',
                                                height: 'auto',
                                            }}>
                                                {verses.map(v => (
                                                    <ListItemButton
                                                        key={v[0]}
                                                        sx={{
                                                            pl: 8,
                                                        }}
                                                        selected={v[0] === currentVerse.reference && v[1] === currentVerse.id}
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
                                    className="text-aera"

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
