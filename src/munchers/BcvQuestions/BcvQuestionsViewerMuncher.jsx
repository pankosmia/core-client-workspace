import {useEffect, useState, useContext} from "react";
import {Box, Grid2, Typography, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, Divider} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Markdown from 'react-markdown';

import {
    i18nContext as I18nContext,
    debugContext as DebugContext,
    bcvContext as BcvContext,
    doI18n,
    getText
} from "pithekos-lib";

import TextDir from '../helpers/TextDir';

function BcvQuestionsViewerMuncher({metadata}) {
    const [ingredient, setIngredient] = useState([]);
    const [textDir, setTextDir] = useState(metadata.script_direction.toLowerCase());

    const {systemBcv} = useContext(BcvContext);
    const {debugRef} = useContext(DebugContext);
    const {i18nRef} = useContext(I18nContext);

    const sbScriptDir = metadata.script_direction.toLowerCase();
    const sbScriptDirSet = sbScriptDir === 'ltr' || sbScriptDir === 'rtl';

    const getAllData = async () => {
        const ingredientLink = `/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.tsv`;
        let response = await getText(ingredientLink, debugRef.current);
        if (response.ok) {
            setIngredient(
                response.text
                    .split(/[\r\n]+/)
                    .slice(1)
                    .filter((l) => l.trim().length > 0)
                    .map(l => l.split("\t").map(f => f.replace(/\\n/g, "\n\n")))
            );
            if (!sbScriptDirSet) {
                const dir = await TextDir(response.text, 'md'); //sometime md sometime text; use md.
                setTextDir(dir);
            }
        } else {
            setIngredient([])
        }
    };

    useEffect(
        () => {
            getAllData().then();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [systemBcv]
    );

    const filteredIngredient = ingredient.filter(l => {

        const expandedVerseNumbers = (evn) => {
            const current = evn.split(",");
            const numbersArray = current.map((num) => {
                if (num.includes("-")){
                    const startValue = Number(num.split("-")[0]);
                    const endValue = Number(num.split("-")[1]);
                    const rangeArray = Array.from({ length: endValue - startValue + 1 }, (_, i) => startValue + i);
                    return rangeArray
                } else {
                    return [Number(num)];
                }
              })
            return [...new Set([].concat(...numbersArray))]
          }

        return l[0].split(":")[0] === `${systemBcv.chapterNum}` && expandedVerseNumbers(l[0].split(":")[1]).includes(systemBcv.verseNum)
    });

    const verseQuestions = filteredIngredient.map(l => l[5]);
    const verseAnswers = filteredIngredient.map(l => l[6]);

    // If SB does not specify direction then it is set here, otherwise it has already been set per SB in WorkspaceCard
    return (
        <Box sx={{ flexGrow: 1 }} dir={!sbScriptDirSet ? textDir : undefined}>
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
                                return (verseAnswers[n].trim().length === 0) ? 
                                    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                                        <ListItem alignItems="flex-start">
                                            <ListItemText primary={<Typography component="span" sx={{fontWeight: "bold"}}>{v}</Typography>}/>
                                        </ListItem>
                                        <Divider variant="middle" component="li" />
                                    </List> :
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
                        <Typography sx={{pl:2}}>No questions found for this verse</Typography>
                    }
                </Grid2>
            </Grid2>
        </Box>
    );
}

export default BcvQuestionsViewerMuncher;
