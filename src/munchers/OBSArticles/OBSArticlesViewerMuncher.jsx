import {useEffect, useState, useContext} from "react";
import {Box, Grid2, Typography, Accordion, AccordionSummary, AccordionDetails} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Markdown from 'react-markdown';
import OBSContext from "../../contexts/obsContext";

import {
    i18nContext as I18nContext,
    debugContext as DebugContext,
    doI18n,
    getText, getJson
} from "pithekos-lib";

function OBSArticlesViewerMuncher({metadata}) {
    const [ingredient, setIngredient] = useState([]);
    const [verseNotes, setVerseNotes] = useState([]);
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
            setIngredient([]);
        }
    };

    useEffect(
        () => {
            getAllData().then();
        },
        [obs]
    );

    useEffect(
        () => {
            const doVerseNotes = async () => {
                let ret = [];
                for (const row of ingredient
                    .filter(l => l[0] === `${obs[0]}:${obs[1]}`)) {
                    let payloadLink = row[5];
                    console.log('payloadLink', payloadLink);
                    let payloadResponse = await getText(`/burrito/ingredient/raw/git.door43.org/uW/en_tw?ipath=${payloadLink.slice(2)}.md`);
                    console.log('payloadResponse', payloadResponse);
                    if (payloadResponse.ok) {
                        ret.push(payloadResponse.text);
                    }
                }
                setVerseNotes(ret);
            }
            doVerseNotes().then();
        },
        [ingredient]
    );
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
                    {verseNotes.length > 0 && [...new Set(verseNotes)].map((v, n) => {
                        return <Accordion>
                            <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1-content"
                            id={`tword-${n}`}
                            >
                            <Typography component="span">{v.split("##")[0].slice(2)}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {ingredient && <Markdown className='markdown'>{v}</Markdown>}
                            </AccordionDetails>
                        </Accordion>
                    })}
                </Grid2>
            </Grid2>
        </Box>
    );
}

export default OBSArticlesViewerMuncher;
