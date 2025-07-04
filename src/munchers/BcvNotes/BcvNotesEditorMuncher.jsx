import { useEffect, useState, useContext } from "react";
import { Box, Button, Stack } from "@mui/material";
import {
    i18nContext as I18nContext,
    debugContext as DebugContext,
    bcvContext as BcvContext,
    getText,
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
    const { systemBcv } = useContext(BcvContext);
    const { debugRef } = useContext(DebugContext);
    const [currentRowN, setCurrentRowN] = useState(1);
    const [ingredientValueChanged, setIngredientValueChanged] = useState(true);
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
        if (
            ingredient[newRow]
        ) {
            setCurrentRowN(currentRowN + 1);
        }
    };

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

                ingredientValueChanged={ingredientValueChanged}
                setIngredientValueChanged={setIngredientValueChanged}

                saveIngredientTsv={saveIngredientTsv}
                setSaveIngredientTsv={setSaveIngredientTsv}
            />
            <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, padding: 2 }}>

                <SearchWithVerses
                    ingredient={ingredient}
                    currentRowN={currentRowN}
                    setCurrentRowN={setCurrentRowN}

                    ingredientValueChanged={ingredientValueChanged}
                    setIngredientValueChanged={setIngredientValueChanged}
                />
                <Editor
                    currentRowN={currentRowN}

                    ingredient={ingredient}
                    setIngredient={setIngredient}

                    setIngredientValueChanged={setIngredientValueChanged}
                    setSaveIngredientTsv={setSaveIngredientTsv}
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
                <Button
                    disabled={!ingredientValueChanged}
                    variant="contained"
                    onClick={() => { previousRow(); setIngredientValueChanged(true) }}
                    sx={{
                        mt: 2,
                         "&.Mui-disabled": {
                            background: "#eaeaea",
                            color: "#424242"
                        }
                    }}
                >
                    {doI18n("pages:core-local-workspace:previous", i18nRef.current)}
                </Button>
                <Button
                    disabled={!ingredientValueChanged}
                    onClick={() => { nextRow(); setIngredientValueChanged(true) }} variant="contained"
                    sx={{
                        mt: 2,
                        "&.Mui-disabled": {
                            background: "#eaeaea",
                            color: "#424242"
                        }
                    }}
                >
                    {doI18n("pages:core-local-workspace:next", i18nRef.current)}
                </Button>
            </Box>
        </Stack >
    );
}

export default BcvNotesViewerMuncher;
