import { useEffect, useState, useContext } from "react";
import { Box, Grid2, Paper, TextField, Typography, ButtonGroup, Button, CardContent, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import Markdown from 'react-markdown';

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

    const verseNotes = ingredient
        .filter(l => l[0] === `${systemBcv.chapterNum}:${systemBcv.verseNum}`)
        .map(l => l[6]);
    return (
        // <Box sx={{backgroundColor:"red"}}>

        //     <h5>{`${metadata.name} (${systemBcv.bookCode} ${systemBcv.chapterNum}:${systemBcv.verseNum})`}</h5>
        //     <h6>{doI18n("munchers:bcv_notes_viewer:title", i18nRef.current)}</h6>
        //     <div>
        //         {ingredient &&
        //             <Markdown>{
        //                 verseNotes.length > 0 ? verseNotes.join("\n***\n") : "No notes found for this verse"
        //             }</Markdown>}
        //     </div>
        // </Box>
        <Box
            sx={{
                minHeight: '100vh',
                padding: 2,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <ButtonGroup variant="contained" aria-label="Basic button group" sx={{ mb: 2 }}>
                <Button>CV</Button>
                <Button>mot</Button>
            </ButtonGroup>
            <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, padding: 2 }}>
                <CardContent sx={{ flex: 1 }}>
                    <FormControl>
                        <FormLabel id="demo-radio-buttons-group-label">Choix</FormLabel>
                        <RadioGroup
                            aria-labelledby="demo-radio-buttons-group-label"
                            defaultValue="Test"
                            name="radio-buttons-group"
                        >
                            <FormControlLabel value="female" control={<Radio />} label="Test" />
                            <FormControlLabel value="male" control={<Radio />} label="Test 2" />
                            <FormControlLabel value="other" control={<Radio />} label="Test 3" />
                        </RadioGroup>
                    </FormControl>
                </CardContent>

                {/* Barre de séparation verticale */}
                <Box sx={{ width: '1px', backgroundColor: '#ccc', mx: 1 }} />

                <CardContent sx={{ flex: 2 }}>
                    <Paper sx={{ padding: 2 }}>
                        <TextField fullWidth label="Reference" margin="normal" />
                        <TextField fullWidth label="id" margin="normal" />
                        <TextField fullWidth label="Note" margin="normal" />
                        <Button variant="contained" sx={{ mt: 2 }}>Modifier</Button>
                    </Paper>
                </CardContent>
            </Box>
        </Box>
    );
}

export default BcvNotesViewerMuncher;
