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

function BcvQuestionsViewerMuncher({metadata}) {
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

    const filteredIngredient = ingredient.filter(l => l[0] === `${systemBcv.chapterNum}:${systemBcv.verseNum}`);
    const verseQuestions = filteredIngredient.map(l => l[5]);
    const verseAnswers = filteredIngredient.map(l => l[6]);

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
                <Grid2 item size={12}>
                    {ingredient &&
                        <Markdown className='markdown'>{
                            verseQuestions.length > 0
                            ?
                            verseQuestions
                                .map((v, n) => {
                                    return `${v}\n* ${verseAnswers[n]}`
                                })
                                .join("\n***\n")
                            :
                            "No questions found for this verse"
                        }</Markdown>}
                </Grid2>
            </Grid2>
        </Box>
    );
}

export default BcvQuestionsViewerMuncher;
