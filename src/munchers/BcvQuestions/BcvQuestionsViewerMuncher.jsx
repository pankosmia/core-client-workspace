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
                    .split(/[\r\n]+/)
                    .slice(1)
                    .filter((l) => l.trim().length > 0)
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

        const expandedVerseNumbers = (evn) => {
            console.log("evn", evn);
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
        
        console.log("expanded",expandedVerseNumbers(l[0].split(":")[1]));

        return l[0].split(":")[0] === `${systemBcv.chapterNum}` && expandedVerseNumbers(l[0].split(":")[1]).includes(systemBcv.verseNum)

       /* const expandedVerseNumbers = (arr) => {
            /* const map1 = arr.map((l) => {
                if (l[0].split(":")[1].includes("-")){
                    const startValue = Number(l[0].split(":")[1].split("-")[0]);
                    const endValue = Number(l[0].split(":")[1].split("-")[1]);
                    const rangeArray = Array.from({ length: endValue - startValue + 1 }, (_, i) => startValue + i);
                    return rangeArray;
                } else {
                    return [l];
                }
            })
        
            
        }; */
        
       

       /*  if (l[0].split(":")[0] === `${systemBcv.chapterNum}`) { */



/*             console.log("chaooooooooooooooooooooooooooooooooooo");
            if (l[0].split(":")[1].includes(",")) {
                if (l[0].split(":")[1].split(",")[0] === `${systemBcv.verseNum}`){
                    return l[0].split(":")[1].split(",")[0] === `${systemBcv.verseNum}`;
                }
                if (l[0].split(":")[1].split(",")[1] === `${systemBcv.verseNum}`){
                    return l[0].split(":")[1].split(",")[1] === `${systemBcv.verseNum}`;
                }
            } */
            /* if (l[0].split(":")[1].includes("-"))  */
/*                 const startValue = l[0].split(":")[1].includes("-") ? Number(l[0].split(":")[1].split("-")[0]) : null;
                const endValue = l[0].split(":")[1].includes("-") ? Number(l[0].split(":")[1].split("-")[1]) : null;
                const rangeArray = Array.from({ length: endValue - startValue + 1 }, (_, i) => startValue + i);
                console.log(rangeArray);

                if (rangeArray.includes(systemBcv.verseNum)){
                    return l[0].split(":")[1].split("-")[0] === `${rangeArray[0]}`;
                } */

                /* const search = rangeArray.find((l) => l === systemBcv.verseNum); */
                
                

                /* rangeArray.forEach((r, n) => {
                    return l[0].split(":")[1].split("-").includes(`${r}`);
                }) */
                
                /* /* for (let i = 0; i < rangeArray.length; i++){
                    return l[0] === `${systemBcv.chapterNum}:${rangeArray[i]}`
                } */
                /* if (l[0].split(":")[1].split("-")[0] === `${systemBcv.verseNum}`){
                    return l[0].split(":")[1].split("-")[0] === `${systemBcv.verseNum}`;
                }
                if (l[0].split(":")[1].split("-")[1] === `${systemBcv.verseNum}`){
                    return l[0].split(":")[1].split("-")[1] === `${systemBcv.verseNum}`;
                } */
            /* }  */
        /* } */
    });

    const filteredIngredient2 = ingredient.filter(l => {
        return l[0] === `${systemBcv.chapterNum}:${systemBcv.verseNum}`;
    });

    const newArray = [...new Set([...filteredIngredient2,...filteredIngredient])];

    const verseQuestions = newArray.map(l => l[5]);
    const verseAnswers = newArray.map(l => l[6]);
    console.log(ingredient);
    /* console.log(filteredIngredient);
    console.log(filteredIngredient); */

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
                                return (verseAnswers[n].trim().length === 0) ? 
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
                        <Typography sx={{paddingLeft:"5%"}}>No questions found for this verse</Typography>
                    }
                </Grid2>
            </Grid2>
        </Box>
    );
}

export default BcvQuestionsViewerMuncher;
