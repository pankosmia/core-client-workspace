import { useEffect, useState, useContext } from "react";
import './BcvNotesMuncher.css'
import { Box, TextField, Button, ToggleButton, ToggleButtonGroup, CardContent, TextareaAutosize, List, ListItemButton, ListItemIcon, ListItemText, Collapse, FormControl, FormLabel } from "@mui/material";
import {
    i18nContext as I18nContext,
    debugContext as DebugContext,
    bcvContext as BcvContext,
    doI18n,
    getText,
    postJson
} from "pithekos-lib";
import SearchNavBar from "../../components/SearchNavBar";
import SearchWithVerses from "../../components/SearchWithVerses";
import { enqueueSnackbar } from "notistack";
import EditorNote from "../../components/EditorNote";

function BcvNotesViewerMuncher({ metadata }) {
    const [ingredient, setIngredient] = useState([]);
    const { systemBcv, setSystemBcv } = useContext(BcvContext);
    const { debugRef } = useContext(DebugContext);
    const { i18nRef } = useContext(I18nContext);
    const [currentRow, setCurrentRow] = useState({ n: 1, content: [] });
    const [currentNote, setCurrentNote] = useState('');
    const [contentChanged, _setContentChanged] = useState(false);

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
            if (newIngredient.length > 0) {
                setCurrentRow({ n: 1, content: [...newIngredient[1]] })
            } else {
                console.log("ingredient fail")
                setCurrentRow(null)
            }
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
    const columnNames = ingredient[0] || [];
    //const oneRow = ingredient.slice(1).filter(line => line[1] === "mh4h")[0];

    const changeCell = (n, v) => {
        const newRow = currentRow
        newRow.content[n] = v
        setContentChanged(currentRow(newRow))
    }
    const nextRow = n => {
        const newRow = currentRow
        newRow.n = n + 1
        newRow.content = ingredient[n + 1]
        console.log("next row", newRow)
    }
    // const updatedContent = (nCol, nVal) => {
    //     let vals = currentRow.content
    //     vals[nCol] = nVal
    //     return {
    //         n: currentRow["n"],
    //         content: vals
    //     }
    // }

    // Montre le changement d'état du contenu 
    const setContentChanged = nv => {
        console.log("setContentChanged", nv);
        _setContentChanged(nv);
    }

    // Met à jour le fichier 
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
            <SearchNavBar getAllData={getAllData}/>
            <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, padding: 2 }}>
                <SearchWithVerses systemBcv={systemBcv} ingredient={ingredient}/>
                <CardContent sx={{ flex: 2 }}>
                    <>
                        {(
                            <List component="div" disablePadding sx={{
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
                                                    <EditorNote currentRow={currentRow} columnNames = {columnNames} />

                                                ) : (
                                                    <p></p>
                                                )
                                            }
                                        </FormControl>
                                    </>
                                ))}
                                <Button onClick={nextRow} variant="contained" sx={{ mt: 2 }}>Modifier</Button>
                            </List>
                        )}
                    </>

                </CardContent>
            </Box>
        </Box >
    );
}

export default BcvNotesViewerMuncher;
