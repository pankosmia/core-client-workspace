import {useEffect, useState, useContext} from "react";
import {Box, Grid2, Typography, Accordion, AccordionSummary, AccordionDetails, Card, CardContent} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
    
    const chapterRegex = new RegExp("/\b([01]?[0-9][0-9]?|2[0-4][0-9]|25[0-5])");

    const filteredIngredient = ingredient.filter(l => {
        const firstVerseCheck = l[0] === `${systemBcv.chapterNum}:`;
        const secondVerseCheck = l[0] === `${systemBcv.chapterNum}:${systemBcv.verseNum}`;
        const splittedVerse = l[0].split(":");
        /* const thirdVerseCheck = l[0] ? (l[0].includes(",") ? true : false) : false;
        const fourthVerseCheck = (l[0].split(",")[0].includes(`${systemBcv.verseNum}`)) || (l[0].split(",")[1].includes(`${systemBcv.verseNum}`)); */
        /* const fourthVerseCheck = l[5] ? (l[5].includes(`${systemBcv.verseNum}`)) : false; */
        console.log(l[0].includes(","));
        if (l[0].split(":")[0] === `${systemBcv.chapterNum}`) {
            console.log("chaooooooooooooooooooooooooooooooooooo");
            if (l[0].split(":")[1].includes(",")) {
                if (l[0].split(":")[1].split(",")[0] === `${systemBcv.verseNum}`){
                    return l[0].split(":")[1].split(",")[0] === `${systemBcv.verseNum}`;
                }
                if (l[0].split(":")[1].split(",")[1] === `${systemBcv.verseNum}`){
                    return l[0].split(":")[1].split(",")[1] === `${systemBcv.verseNum}`;
                }
            }
            if (l[0].split(":")[1].includes("-")) {
                if (l[0].split(":")[1].split("-")[0] === `${systemBcv.verseNum}`){
                    return l[0].split(":")[1].split("-")[0] === `${systemBcv.verseNum}`;
                }
                if (l[0].split(":")[1].split("-")[1] === `${systemBcv.verseNum}`){
                    return l[0].split(":")[1].split("-")[1] === `${systemBcv.verseNum}`;
                }
            }
            
        }
    });

    const filteredIngredient2 = ingredient.filter(l => {
        return l[0] === `${systemBcv.chapterNum}:${systemBcv.verseNum}`;
    });

    const newArray =[...new Set([...filteredIngredient2,...filteredIngredient])];

    const verseQuestions = newArray.map(l => l[5]);
    const verseAnswers = filteredIngredient2.map(l => l[6]);
    console.log(ingredient);
    console.log(filteredIngredient);
    console.log(filteredIngredient);

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
                    {ingredient && verseQuestions.length > 0 ?
                        verseQuestions
                            .map((v, n) => {
                                return (ingredient[1][5].includes("Study Questions")) ? 
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography component="span" sx={{fontWeight: "bold"}}>{v}</Typography>
                                        </CardContent>
                                    </Card> :
                                    <Accordion>
                                        <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1-content"
                                        id={`tword-${n}`}
                                        >
                                        <Typography component="span" sx={{fontWeight: "bold"}}>{v}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {ingredient && <Markdown className='markdown'>{`${verseAnswers[n]}`}</Markdown>}
                                        </AccordionDetails>
                                    </Accordion>
                            })
                        :
                        "No questions found for this verse"
                    }
                </Grid2>
            </Grid2>
        </Box>
    );
}

export default BcvQuestionsViewerMuncher;
