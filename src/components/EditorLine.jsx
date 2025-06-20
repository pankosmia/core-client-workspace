import { useState, useContext } from "react";
import { TextField, Button, FormControl, FormLabel, List,Box } from "@mui/material";
import {
    i18nContext as I18nContext,
    debugContext as DebugContext,
    bcvContext as BcvContext,
    doI18n,
    postJson
} from "pithekos-lib";
import { enqueueSnackbar } from "notistack";
import EditorNote from "../components/EditorNote"

function EditorLine({ currentRow, ingredient, setIngredient, setCurrentRow }) {
    const { systemBcv } = useContext(BcvContext);
    const { i18nRef } = useContext(I18nContext);
    const [contentChanged, _setContentChanged] = useState(false);
    const [changeCellValue, setChangeCellValue] = useState(false);
    // Inialisation des données au départ
    const columnNames = ingredient[0] || [];
    //const oneRow = ingredient.slice(1).filter(line => line[1] === "mh4h")[0];

    const changeCell = (event, n) => {
        const newCellValue = event.target.value;
        const newCurrentRow = {
            ...currentRow,
            content: [...currentRow.content]
        };
        newCurrentRow.content[n] = newCellValue;
        // setIngredient(newRow);
        setCurrentRow(newCurrentRow);
        setChangeCellValue(true);
    };
    console.log("changement de valeur", changeCellValue)

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
        if (currentRow.content[n].length > 0) {
            uploadTsvIngredient(ingredient)
        }
    }

    const handleCancel = () => {
        setIngredient(ingredient);
    };

    return (
        <Box>
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
                        {column === 'Note' ? (
                            <EditorNote
                                currentRow={currentRow}
                                columnNames={columnNames}
                                onChangeNote={(e) => changeCell(e, n)}

                            />
                        ) : (
                            <TextField
                                value={currentRow.content[n] || ''}
                                variant="outlined"
                                fullWidth
                                size="small"
                                onChange={(e) => changeCell(e, n)}

                            />
                        )}

                    </FormControl>
                </>
            ))}
            <Box sx={{display: 'flex', gap: 2, padding: 5}}>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={!changeCellValue}
                    sx={{
                        mt: 2,
                        backgroundColor: changeCellValue ? 'primary' : 'grey.400',
                        color: 'white',
                        
                    }}
                >
                    Enregistrer
                </Button>
                <Button onClick={handleCancel} variant="contained" disabled={!changeCellValue} sx={{ mt: 2,
                        backgroundColor: changeCellValue ? 'primary' : 'grey.400',
                        color: 'white', }}>Annuler</Button>
            </Box>
        </Box>
    );
}

export default EditorLine;
