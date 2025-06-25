import { useEffect, useState, useContext } from "react";
import { Box, Button, Stack } from "@mui/material";
import {
    debugContext as DebugContext,
    bcvContext as BcvContext,
    getText,
} from "pithekos-lib";
import SearchNavBar from "../../components/SearchNavBar";
import SearchWithVerses from "../../components/SearchWithVerses";
import EditorLines from "../../components/EditorLines"
import AddLine from "../../components/AddLine";
import SaveTsvIngredient from "../../components/SaveTsvIngredient";
import EditorOneLine from "../../components/EditorOneLine"

function BcvNotesViewerMuncher({ metadata }) {
    const [ingredient, setIngredient] = useState([]);
    const { systemBcv } = useContext(BcvContext);
    const { debugRef } = useContext(DebugContext);
    const [currentRow, setCurrentRow] = useState({ n: 1, content: [] });

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

    return (
        <Stack sx={{
            padding: 2,
        }}
        >
            <SearchNavBar getAllData={getAllData} />
            <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, padding: 2 }}>
                
                <AddLine currentRow={currentRow} setCurrentRow={setCurrentRow} ingredient={ingredient} setIngredient={setIngredient}/>

                <SearchWithVerses systemBcv={systemBcv} ingredient={ingredient} setCurrentRow={setCurrentRow} />
                <EditorLines
                    currentRow={currentRow} ingredient={ingredient} setIngredient={setIngredient} setCurrentRow={setCurrentRow} metadata={metadata}
                />
                {/* <EditorOneLine currentRow={currentRow} setCurrentRow={setCurrentRow} ingredient={ingredient} setIngredient={setIngredient}/> */}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, padding: 1, justifyContent: "center" }}>
            <SaveTsvIngredient ingredient={ingredient} metadata={metadata} setIngredient={setIngredient} />
                <Button onClick={previousRow} variant="contained" sx={{ mt: 2 }}>
                    précédent
                </Button>
                <Button onClick={nextRow} variant="contained" sx={{ mt: 2 }}>
                    suivant
                </Button>
            </Box>
        </Stack >
    );
}

export default BcvNotesViewerMuncher;
