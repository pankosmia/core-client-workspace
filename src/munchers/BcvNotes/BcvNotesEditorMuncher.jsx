import { useEffect, useState, useContext } from "react";
import { Box, Button, Stack, TextField } from "@mui/material";
import {
    i18nContext as I18nContext,
    debugContext as DebugContext,
    bcvContext as BcvContext,
    getText,
    doI18n,
} from "pithekos-lib";

import SearchNavBar from "../../components/SearchNavBar";
import SearchWithVerses from "../../components/SearchWithVerses";
import Editor from "../../components/Editor"
import AddFab from "../../components/AddFab";
import SaveTsvButton from "../../components/SaveTsvButton";

function BcvNotesViewerMuncher({ metadata }) {
    const [ingredient, setIngredient] = useState([]);
    const { i18nRef } = useContext(I18nContext);
    const { systemBcv } = useContext(BcvContext);
    const { debugRef } = useContext(DebugContext);
    const [currentRowN, setCurrentRowN] = useState(1);

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
            setIngredient(newIngredient);
        }
    };
    // utilisation de la fonction getAllData
    useEffect(
        () => {
            getAllData().then();
        },
        [systemBcv]
    );

    // changer de page -1 
    const previousRow = () => {
        const newRow = currentRowN - 1;
        if (newRow >= 1 && ingredient.length > 1 && ingredient[newRow]) {
            setCurrentRowN(currentRowN - 1);
        }
    };


    // changer de page +1 
    const nextRow = () => {
        const newRow = currentRowN + 1;
        // const currentChapterNum = parseInt(ingredient[newRow][0].split(":")[0])
        if (
            ingredient[newRow]
            // && currentChapterNum <= systemBcv.chapterNum
        ) {
            setCurrentRowN(currentRowN + 1);
        }
    };


    return (
        <Stack sx={{
            padding: 2,
        }}
        >
            <SearchNavBar getAllData={getAllData} />
            <TextField value={currentRowN} />
            <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, padding: 2 }}>

                <AddFab
                    currentRowN={currentRowN}
                    setCurrentRowN={setCurrentRowN}
                    ingredient={ingredient}
                    setIngredient={setIngredient}
                />

                <SearchWithVerses
                    systemBcv={systemBcv}
                    ingredient={ingredient}
                    setCurrentRowN={setCurrentRowN}
                />
                <Editor
                    currentRowN={currentRowN}
                    ingredient={ingredient}
                    setIngredient={setIngredient}
                    setCurrentRowN={setCurrentRowN}
                    metadata={metadata}
                    mode="edit"
                />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, padding: 1, justifyContent: "center" }}>
                <SaveTsvButton
                    ingredient={ingredient}
                    metadata={metadata}
                    setIngredient={setIngredient}
                />
                <Button onClick={previousRow} variant="contained" sx={{ mt: 2 }}>
                    {doI18n("pages:core-local-workspace:previous", i18nRef.current)}
                </Button>
                <Button onClick={nextRow} variant="contained" sx={{ mt: 2 }}>
                      {doI18n("pages:core-local-workspace:next", i18nRef.current)}
                </Button>
            </Box>
        </Stack >
    );
}

export default BcvNotesViewerMuncher;
