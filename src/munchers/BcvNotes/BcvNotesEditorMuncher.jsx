import { useEffect, useState, useContext } from "react";
import { Box, Paper, TextField, ButtonGroup, Button, CardContent, ListSubheader, TextareaAutosize, List, ListItemButton, ListItemIcon, ListItemText, Collapse, FormControl, FormLabel } from "@mui/material";
import { ExpandLess, ExpandMore, StarBorder } from "@mui/icons-material"
import Markdown from 'react-markdown';
import InboxIcon from '@mui/icons-material/MoveToInbox';

import {
    i18nContext as I18nContext,
    debugContext as DebugContext,
    bcvContext as BcvContext,
    doI18n,
    getText
} from "pithekos-lib";

function BcvNotesViewerMuncher({ metadata }) {
    const [ingredient, setIngredient] = useState([]);
    const { systemBcv } = useContext(BcvContext);
    const { debugRef } = useContext(DebugContext);
    const { i18nRef } = useContext(I18nContext);
    const [open, setOpen] = useState(true);
    const [stateButtonNote, setStateButtonNote] = useState('write');
    const [mode, setMode] = useState('');

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

    useEffect(() => {
        console.log('Mode actuel :', stateButtonNote);
    }, [stateButtonNote]);

    const handleClick = () => {
        setOpen(!open);
    };

    const referenceNotes = ingredient
        .filter(l => l[0] === `${systemBcv.chapterNum}:${systemBcv.verseNum}`)
        .map(l => l[0]);

    const referenceIdNotes = ingredient
        .filter(l => l[0] === `${systemBcv.chapterNum}:${systemBcv.verseNum}`)
        .map(l => l[1]);
    const referenceTagsNotes = ingredient
        .filter(l => l[0] === `${systemBcv.chapterNum}:${systemBcv.verseNum}`)
        .map(l => l[2]);
    const referenceSupportNotes = ingredient
        .filter(l => l[0] === `${systemBcv.chapterNum}:${systemBcv.verseNum}`)
        .map(l => l[3]);
    const referenceQuoteNotes = ingredient
        .filter(l => l[0] === `${systemBcv.chapterNum}:${systemBcv.verseNum}`)
        .map(l => l[4]);
    const referenceOccurrenceNotes = ingredient
        .filter(l => l[0] === `${systemBcv.chapterNum}:${systemBcv.verseNum}`)
        .map(l => l[5]);

    const verseNotes = ingredient
        .filter(l => l[0] === `${systemBcv.chapterNum}:${systemBcv.verseNum}`)
        .map(l => l[6]);
    return (
        <Box sx={{
            minHeight: '100vh',
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
        }}
        >
            <h5>{`${metadata.name} (${systemBcv.bookCode} ${systemBcv.chapterNum}:${systemBcv.verseNum})`}</h5>
            <h6>{doI18n("munchers:bcv_notes_viewer:title", i18nRef.current)}</h6>
            <div>
                {ingredient &&
                    <Markdown>{
                        verseNotes.length > 0 ? verseNotes.join("\n***\n") : "No notes found for this verse"}
                    </Markdown>}
            </div>

            <ButtonGroup variant="contained" aria-label="Basic button group" sx={{ mb: 2 }}>
                <Button>CV</Button>
                <Button>mot</Button>
            </ButtonGroup>
            <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, padding: 2 }}>
                <List
                    sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
                    component="nav"
                    aria-labelledby="nested-list-subheader"
                    subheader={
                        <ListSubheader component="div" id="nested-list-subheader">
                            Nested List Items
                        </ListSubheader>
                    }
                >
                    <ListItemButton onClick={handleClick}>
                        <ListItemIcon>
                            <InboxIcon />
                        </ListItemIcon>
                        <ListItemText primary="Inbox" />
                        {open ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItemButton sx={{ pl: 4 }}>
                                <ListItemIcon>
                                    <StarBorder />
                                </ListItemIcon>
                                <ListItemText primary="Starred" />
                            </ListItemButton>
                        </List>
                    </Collapse>
                </List>
                <CardContent sx={{ flex: 2 }}>
                    <Paper sx={{ padding: 2 }}>
                        <TextField fullWidth label="Reference" margin="normal" value={referenceNotes} />
                        <TextField fullWidth label="Id" margin="normal" value={referenceIdNotes} />
                        <TextField fullWidth label="Tags" margin="normal" value={referenceTagsNotes} />
                        <TextField fullWidth label="Support Reference" margin="normal" value={referenceSupportNotes} />
                        <TextField fullWidth label="Quote" margin="normal" value={referenceQuoteNotes} />
                        <TextField fullWidth label="Occurence" margin="normal" value={referenceOccurrenceNotes} />

                        <ButtonGroup
                            disableElevation
                            variant="contained"
                            aria-label="Disabled button group"
                        >
                            <Button onClick={() => setStateButtonNote('write')}>Write </Button>
                            <Button onClick={() => setStateButtonNote('preview')} > Preview </Button>
                        </ButtonGroup>

                        {stateButtonNote === 'write' ? (
                            <FormControl fullWidth margin="normal">
                                <FormLabel>Note</FormLabel>
                                <TextareaAutosize
                                    minRows={4}
                                    value={verseNotes}
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
                                verseNotes.length > 0 ? verseNotes.join("\n***\n") : "No notes found for this verse"}
                            </Markdown>
                        )}
                        <Button variant="contained" sx={{ mt: 2 }}>Modifier</Button>
                    </Paper>
                </CardContent>
            </Box>
        </Box>

    );
}


export default BcvNotesViewerMuncher;
