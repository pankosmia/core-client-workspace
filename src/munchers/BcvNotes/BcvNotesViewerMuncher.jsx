import {useEffect, useState, useContext} from "react";
import {Box, Grid2, Typography} from "@mui/material";
import Markdown from 'react-markdown';

import {
    i18nContext as I18nContext,
    debugContext as DebugContext,
    bcvContext as BcvContext,
    doI18n,
    getText
} from "pithekos-lib";

function BcvNotesViewerMuncher({metadata}) {
    const [ingredient, setIngredient] = useState([]);
    const {systemBcv} = useContext(BcvContext);
    const {debugRef} = useContext(DebugContext);
    const {i18nRef} = useContext(I18nContext);

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

    const cvInRange = (cv, range) => {
        const [cvC, cvV] = cv.split(":");
        const [rangeC, rangeV] = range.split(":");
        if (cvC !== rangeC) {
            return false;
        }
        if (rangeV.includes("-")) {
            const [fromV, toV] = rangeV.split("-").map(v => parseInt(v));
            return (cvV >= fromV && cvV <= toV)
        } else {
            return (cvV === rangeV);
        }
    }

    const filteredIngredient = ingredient.filter(l => cvInRange(`${systemBcv.chapterNum}:${systemBcv.verseNum}`, l[0]));
    const verseNotes = filteredIngredient.map(l => l[6] || l[5]);
    const verseIds = filteredIngredient.map(l => l[1]);
    const verseSupReferences = filteredIngredient.map(l => l[3]);

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Grid2 
                container
                direction="row"
                sx={{
                    display:"flex",
                    justifyContent: "center",
                    alignItems: "center"
                 }}
            >   
                <Grid2
                    item 
                    size={3} 
                    sx={{
                        display:"flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    <Typography variant="subtitle1">{`(${systemBcv.bookCode} ${systemBcv.chapterNum}:${systemBcv.verseNum})`}</Typography>
                </Grid2>
                <Grid2 item size={12} sx={{paddingRight:"5%"}}>
                    {ingredient &&
                        <Markdown className='markdown'>{
                            verseNotes.length > 0
                            ?
                            verseNotes
                                .map((v, n) => {
                                    return `* (**${verseIds[n]}**) ${v.replace(". \n\n\n\n ", ". \n\n * ")}${!(verseSupReferences[n] === "") ? ` (${verseSupReferences[n].replace("rc://*/ta/man/translate/", "")})` : ""}`
                                })
                                .join("\n")
                            :
                            "No notes found for this verse"
                        }</Markdown>
                    }
                </Grid2>
            </Grid2>
        </Box>
    );
}

export default BcvNotesViewerMuncher;
