import {useEffect, useState, useContext} from "react";
import {Box, Grid2, Typography, Accordion, AccordionSummary, AccordionDetails, Card, CardContent} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Markdown from 'react-markdown';
import OBSContext from "../../contexts/obsContext";

import {
    i18nContext as I18nContext,
    debugContext as DebugContext,
    doI18n,
    getText
} from "pithekos-lib";

function OBSQuestionsViewerMuncher({metadata}) {
    const [ingredient, setIngredient] = useState([]);
    const {obs} = useContext(OBSContext);
    const {debugRef} = useContext(DebugContext);
    const {i18nRef} = useContext(I18nContext);
    

    const getAllData = async () => {
        const ingredientLink = `/burrito/ingredient/raw/${metadata.local_path}?ipath=OBS.tsv`;
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
        [obs]
    );
    const filteredIngredient = ingredient.filter(l => {
        const [chapter, verse] = l[0].split(":");
        if (!chapter || !verse) return false;
        if (verse.includes("-")) {
            const [start, end] = verse.split("-");
            if (!start || !end) return false;
            return parseInt(chapter) === obs[0] && (parseInt(start) <= obs[1] && parseInt(end) >= obs[1]);
        } else {
            return parseInt(chapter) === obs[0] && parseInt(verse) === obs[1];
        }
    });
    const verseQuestions = filteredIngredient.map(l => l[5]);
    const verseAnswers = filteredIngredient.map(l => l[6]);
    const verseNumber = filteredIngredient.map(l => l[0]);
    const verseTags = filteredIngredient.map(l => l[2].split(",").map(t => t.trim()));

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
                    <Typography variant="subtitle1">{`(${obs[0]}:${obs[1]})`}</Typography>
                </Grid2>
                <Grid2 item size={12}>
                    {ingredient && verseQuestions.length > 0 ?
                        verseQuestions
                            .map((v, n) => {
                                return (verseTags[n].includes("summary")) ? 
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography component="span" sx={{fontStyle: "italic"}}>{`${verseNumber[n]} - ${verseAnswers[n]}`}</Typography>
                                        </CardContent>
                                    </Card> :
                                    <Accordion>
                                        <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1-content"
                                        id={`tword-${n}`}
                                        >
                                        <Typography component="span">{`${verseNumber[n]} - ${v}`}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {ingredient && <Markdown className='markdown'>{`${verseAnswers[n]}`}</Markdown>}
                                        </AccordionDetails>
                                    </Accordion>
                            })
                        :
                        "No questions found for this paragraph"
                    }
                </Grid2>
            </Grid2>
        </Box>
    );
}

export default OBSQuestionsViewerMuncher;
