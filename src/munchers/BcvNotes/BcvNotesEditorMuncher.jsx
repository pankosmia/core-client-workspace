import { useEffect, useState, useContext } from "react";
import { Box, Stack } from "@mui/material";
import {
    debugContext as DebugContext,
    bcvContext as BcvContext,
    getText,
    postEmptyJson,
} from "pithekos-lib";

//import SearchNavBar from "../../components/SearchNavBar";
import SearchWithVerses from "../../components/SearchWithVerses";
import Editor from "../../components/Editor"
import AddFab from "../../components/AddFab";
import SaveTsvButton from "../../components/SaveTsvButton";
import md5 from "md5";

function BcvNotesEditorMuncher({ metadata }) {
    const [ingredient, setIngredient] = useState([]);
    const { systemBcv, setSystemBcv } = useContext(BcvContext);
    const { debugRef } = useContext(DebugContext);
    const [currentRowN, setCurrentRowN] = useState(1);
    const [md5Ingredient, setMd5Ingredient] = useState([]);
    const [cellValueChanged, setCellValueChanged] = useState(false);
    const [currentRow, setCurrentRow] = useState(Array(7).fill("", 0, 7))

    console.log("ingredient", ingredient)
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
            const hash = md5(JSON.stringify(newIngredient));
            setMd5Ingredient(hash);
        }
    };
    // utilisation de la fonction getAllData
    useEffect(
        () => {
            getAllData().then();

        },

        [systemBcv.bookCode]
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
            <Box sx={{ display: 'flex', gap: 2 }}>
                <AddFab
                    currentRowN={currentRowN}
                    setCurrentRowN={setCurrentRowN}

                    ingredient={ingredient}
                    setIngredient={setIngredient}
                    cellValueChanged={cellValueChanged}
                    setCellValueChanged={setCellValueChanged}
                />
                <SaveTsvButton
                    metadata={metadata}

                    ingredient={ingredient}
                    setIngredient={setIngredient}

                    md5Ingredient={md5Ingredient}
                    setMd5Ingredient={setMd5Ingredient}
                />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, padding: 2 }}>

                <SearchWithVerses
                    ingredient={ingredient}
                    setIngredient={setIngredient}
                    updateBcv={updateBcv}

                    currentRowN={currentRowN}
                    setCurrentRowN={setCurrentRowN}

                    currentRow={currentRow}
                    setCurrentRow={setCurrentRow}
                />
                <Editor
                    currentRowN={currentRowN}
                    setCurrentRowN={setCurrentRowN}

                    ingredient={ingredient}
                    setIngredient={setIngredient}

                    updateBcv={updateBcv}

                    cellValueChanged={cellValueChanged}
                    setCellValueChanged={setCellValueChanged}

                    currentRow={currentRow}
                    setCurrentRow={setCurrentRow}
                />
            </Box>

        </Stack >
    );

}

export default BcvNotesEditorMuncher;
