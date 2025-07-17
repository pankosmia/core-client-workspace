import { useEffect, useState, useContext } from "react";
import { Box, Stack } from "@mui/material";
import {
    i18nContext as I18nContext,
    debugContext as DebugContext,
    bcvContext as BcvContext,
    getText,
    postEmptyJson,
    doI18n,
} from "pithekos-lib";

//import SearchNavBar from "../../components/SearchNavBar";
import SearchWithVerses from "../../components/SearchWithVerses";
import Editor from "../../components/Editor"
import AddFab from "../../components/AddFab";
import SaveTsvButton from "../../components/SaveTsvButton";


function BcvNotesViewerMuncher({ metadata }) {
    const [ingredient, setIngredient] = useState([]);
    const { i18nRef } = useContext(I18nContext);
    const { systemBcv, setSystemBcv } = useContext(BcvContext);
    const { debugRef } = useContext(DebugContext);
    const [currentRowN, setCurrentRowN] = useState(1);
    const [saveIngredientTsv, setSaveIngredientTsv] = useState(false)


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

    const updateBcv = rowN => {
        const newCurrentRowCV = ingredient[rowN][0].split(":")
        postEmptyJson(
            `/navigation/bcv/${systemBcv["bookCode"]}/${newCurrentRowCV[0]}/${newCurrentRowCV[1]}`,
            debugRef.current
        );

    }
 
    useEffect(() => {
        const onBeforeUnload = ev => {
            ev.preventDefault();
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Stack sx={{
            padding: 2,
        }}
        >
            {/* <SearchNavBar getAllData={getAllData} /> */}
            <AddFab
                currentRowN={currentRowN}
                setCurrentRowN={setCurrentRowN}

                ingredient={ingredient}
                setIngredient={setIngredient}

                saveIngredientTsv={saveIngredientTsv}
                setSaveIngredientTsv={setSaveIngredientTsv}
            />
            <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, padding: 2 }}>

                <SearchWithVerses
                    ingredient={ingredient}
                    currentRowN={currentRowN}
                    setCurrentRowN={setCurrentRowN}
                    updateBcv={updateBcv}
                />
                <Editor
                    currentRowN={currentRowN}
                    setCurrentRowN={setCurrentRowN}
                    
                    ingredient={ingredient}
                    setIngredient={setIngredient}

                    setSaveIngredientTsv={setSaveIngredientTsv}
                    updateBcv={updateBcv}
                />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, padding: 1, justifyContent: "center" }}>
                <SaveTsvButton
                    metadata={metadata}

                    ingredient={ingredient}
                    setIngredient={setIngredient}

                    saveIngredientTsv={saveIngredientTsv}
                    setSaveIngredientTsv={setSaveIngredientTsv}

                />
            </Box>
        </Stack >
    );
}

export default BcvNotesViewerMuncher;
