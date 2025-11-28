import {useEffect, useState, useContext, useCallback} from "react";
import {Box, Stack} from "@mui/material";
import {
    debugContext as DebugContext,
    bcvContext as BcvContext,
    getText,
    postEmptyJson,
} from "pithekos-lib";

import SearchWithVerses from "./components/SearchWithVerses";
import Editor from "./components/Editor"
import AddFab from "./components/AddFab";
import SaveTsvButton from "./components/SaveTsvButton";
import md5 from "md5";
import BcvPicker from "../../pages/Workspace/BcvPicker";

function BcvNotesEditorMuncher({metadata}) {
    const [ingredient, setIngredient] = useState([]);
    const {systemBcv} = useContext(BcvContext);
    const {debugRef} = useContext(DebugContext);
    const [currentRowN, setCurrentRowN] = useState(1);
    const [md5Ingredient, setMd5Ingredient] = useState([]);
    const [cellValueChanged, setCellValueChanged] = useState(false);

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
        const newCurrentRow = ingredient[rowN][0];
        if (newCurrentRow[0]) {
            const newCurrentRowCV = newCurrentRow[0].split(":");
            if (newCurrentRowCV.length === 2) {
                postEmptyJson(
                    `/navigation/bcv/${systemBcv["bookCode"]}/${newCurrentRowCV[0]}/${newCurrentRowCV[1].split("-")[0]}`,
                    debugRef.current
                );
            }
        }
    }

    const isModified = useCallback(
        () => {
        const originalChecksum = md5Ingredient;
        if (!originalChecksum) {
            return false;
        }
        const currentChecksum = md5(JSON.stringify(ingredient));
        return originalChecksum !== currentChecksum;
    },
        [ingredient, md5Ingredient]
    );
    useEffect(() => {
        const isElectron = !!window.electronAPI;
        if (isElectron) {
            if (isModified()) {
                window.electronAPI.setCanClose(false);
            } else {
                window.electronAPI.setCanClose(true);
            }
        }
    }, [isModified]);

    return (
        <Stack sx={{
            padding: 2,
        }}
        >
            {/* <SearchNavBar getAllData={getAllData} /> */}
            <Box sx={{
                position: "fixed",
                top: "48px",
                left: 0,
                right: 0,
                display: "flex",
                padding: 2,
            }}>
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
                <BcvPicker/>
            </Box>

            <Box sx={{display: 'flex', gap: 2, flexGrow: 1, padding: 2}}>

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

                    updateBcv={updateBcv}

                    cellValueChanged={cellValueChanged}
                    setCellValueChanged={setCellValueChanged}
                />
            </Box>

        </Stack>
    );

}

export default BcvNotesEditorMuncher;
