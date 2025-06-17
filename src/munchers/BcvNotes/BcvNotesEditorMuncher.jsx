import { useEffect, useState, useContext } from "react";
import './BcvNotesMuncher.css'
import { Box, TextField, Button, ToggleButton, ToggleButtonGroup, CardContent, TextareaAutosize, List, ListItemButton, ListItemIcon, ListItemText, Collapse, FormControl, FormLabel } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material"
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import {
    i18nContext as I18nContext,
    debugContext as DebugContext,
    bcvContext as BcvContext,
    doI18n,
    getText,
    postJson
} from "pithekos-lib";
import SearchNavBar from "../../components/searchNavBar";
import { enqueueSnackbar } from "notistack";

function BcvNotesViewerMuncher({ metadata }) {
    const [ingredient, setIngredient] = useState([]);
    const { systemBcv, setSystemBcv } = useContext(BcvContext);
    const { debugRef } = useContext(DebugContext);
    const { i18nRef } = useContext(I18nContext);
    const [open, setOpen] = useState(false);
    const [currentRow, setCurrentRow] = useState({ n: 1, content: [] });
    const [currentNote, setCurrentNote] = useState('');
    const [currentChapter, setCurrentChapter] = useState('');
    const [currentVerse, setCurrentVerse] = useState({ reference: '', id: '' });
    const [value, setValue] = useState('');
    const [contentChanged, _setContentChanged] = useState(false);
    const [page, setPage] = useState(4)

    // Récupération des données du tsv
    const getAllData = async () => {
        const ingredientLink = `/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.tsv`;
        let response = await getText(ingredientLink, debugRef.current);
        if (response.ok) {
            const newIngredient = response.text
                .split("\n")
                .map(l => l.split("\t").map(f => f.replace(/\\n/g, "\n\n")))
            setIngredient(
                newIngredient
            );
            console.log("newINgredient", newIngredient)
            setCurrentRow({ n: 1, content: [...newIngredient[1]] })
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
    // useEffect(() => {
    //     if (
    //         currentVerse.reference === "" &&
    //         currentVerse.id === ""
    //     ) {
    //         const ColumName = ingredient.map(ligne => [...ligne]);
    //         console.log("colum name", ColumName)
    //         // if (newCurrentRow) {
    //         //     setCurrentReference(newCurrentRow[0])
    //         //     setCurrentRow(newCurrentRow[1]);
    //         //     setCurrentTags(newCurrentRow[2]);
    //         //     setCurrentSupportReference(newCurrentRow[3]);
    //         //     setCurrentQuote(newCurrentRow[4]);
    //         //     setCurrentOccurrence(newCurrentRow[5]);
    //         //     setCurrentNote(newCurrentRow[6]);
    //         // }
    //     }

    // }, [ingredient, systemBcv]);

    const columnNames = ingredient[0] || [];

    const oneRow = ingredient.slice(1).filter(line => line[1] === "mh4h")[0];

    const updatedContent = (nCol, nVal) => {
        let vals = currentRow.content
        vals[nCol] = nVal
        return {
            n: currentRow["n"],
            content: vals
        }
    }

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
    const bookCode = [systemBcv.chapterNum]
    const verses = currentChapter
        ? ingredient.filter(l => l[0].startsWith(`${currentChapter}:`))
        : [];


    const uploadTsvIngredient = async (tsvData, debugBool) => {
        const tsvString = tsvData
            .map(
                r => r.map(
                    c => c.replace(/\n/g, "\\n")
                )
            )
            .map(r => r.join("\t"))
            .join("\n");
        const payload = JSON.stringify({ payload: tsvString });
        const response = await postJson(
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
            uploadTsvIngredient(ingredient)
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
                            {bookCode.map(chap => (
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
                                                maxHeight: '400px',
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
                    <>
                        {(
                            <List component="div" disablePadding sx={{
                                maxHeight: '800px',
                                overflowY: 'auto',
                                height: 'auto',
                            }}>

                                {columnNames.map((column, n) => (
                                    <>
                                        <FormControl fullWidth margin="normal" key={n}>
                                            <FormLabel
                                                sx={{
                                                    fontWeight: 'bold',
                                                    fontSize: '1.1rem',
                                                    mb: 1,
                                                }}
                                            >
                                                {column}
                                            </FormLabel>
                                            <TextField
                                                value={currentRow.content[n]}
                                                variant="outlined"
                                                fullWidth
                                                size="small"
                                            />

                                            {
                                                column === 'Note' ? (
                                                    <p>Test reussi </p>
                                                ) : (
                                                    <p>test non reussi </p>
                                                )
                                            }
                                        </FormControl>

                                    </>
                                ))}
                            </List>

                        )}
                    </>

                </CardContent>
            </Box>
        </Box >

    );

}

export default BcvNotesViewerMuncher;
