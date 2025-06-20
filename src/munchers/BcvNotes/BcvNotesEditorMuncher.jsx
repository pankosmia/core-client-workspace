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
import EditorLine from "../../components/EditorLine"

function BcvNotesViewerMuncher({ metadata }) {
    const [ingredient, setIngredient] = useState([]);
    const { systemBcv } = useContext(BcvContext);
    const { debugRef } = useContext(DebugContext);
    const { i18nRef } = useContext(I18nContext);
    const [currentRow, setCurrentRow] = useState({ n: 1, content: [] });
    const [contentChanged, _setContentChanged] = useState(false);

    // Récupération des données du tsv
    const getAllData = async () => {
        const ingredientLink = `/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.tsv`;
        let response = await getText(ingredientLink, debugRef.current);
        if (response.ok) {
            const newIngredient = response.text
                .split("\n")
                .map(l => l.split("\t")
                    .map(f => f.replace(/(\\n){2,}/g, "\n\n"))
                )
            setIngredient(
                newIngredient
            );
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
    console.log("ingredient", ingredient)
    // utilisation de la fonction getAllData
    useEffect(
        () => {
            getAllData().then();
        },
        [systemBcv]
    );

    // changer de page -1 
    const previousRow = () => {
        const newRow = currentRow.n - 1;
        if (ingredient.length > 1 && ingredient[newRow]) {
            setCurrentRow({
                n: newRow,
                content: ingredient[newRow]
            });
        }
    };

    // changer de page +1 
    const nextRow = () => {
        const newRow = currentRow.n + 1;
        if (ingredient.length > 0 && ingredient[newRow]) {
            setCurrentRow({
                n: newRow,
                content: ingredient[newRow]
            });
        }
    };

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
    return (
        <Box sx={{
            minHeight: '100px',
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
            height:"auto"
        }}
        >
            <SearchNavBar getAllData={getAllData} />
            <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, padding: 2 }}>
                <SearchWithVerses systemBcv={systemBcv} ingredient={ingredient} setCurrentRow={setCurrentRow} />
                <EditorLine
                    currentRow={currentRow} ingredient={ingredient} setIngredient={setIngredient} setCurrentRow={setCurrentRow}
                />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, padding: 5, justifyContent:"center" }}>
                <Button onClick={previousRow} variant="contained" sx={{ mt: 2 }}>
                    précédent
                </Button>
                <Button onClick={nextRow} variant="contained" sx={{ mt: 2 }}>
                    suivant
                </Button>
            </Box>


        </Box >
    );
}

export default BcvNotesViewerMuncher;
