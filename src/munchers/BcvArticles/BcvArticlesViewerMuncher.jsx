import {useEffect, useState, useContext} from "react";
import {Box, Grid2, Typography, Accordion, AccordionSummary, AccordionDetails} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Markdown from 'react-markdown';

import {
    i18nContext as I18nContext,
    debugContext as DebugContext,
    bcvContext as BcvContext,
    doI18n,
    getText, getJson
} from "pithekos-lib";

import TextDir from '../helpers/TextDir';

function BcvArticlesViewerMuncher({metadata}) {
    const [ingredient, setIngredient] = useState([]);
    const [verseNotes, setVerseNotes] = useState([]);
    const [textDir, setTextDir] = useState(
      metadata?.script_direction ? metadata.script_direction.toLowerCase() : undefined
    );

    const {systemBcv} = useContext(BcvContext);
    const {debugRef} = useContext(DebugContext);
    const {i18nRef} = useContext(I18nContext);

    const sbScriptDir = metadata?.script_direction ? metadata.script_direction.toLowerCase() : undefined
    const sbScriptDirSet = sbScriptDir === 'ltr' || sbScriptDir === 'rtl';

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
            setIngredient([]);
        }
    };

    useEffect(
        () => {
            getAllData().then();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [systemBcv]
    );

    useEffect(
        () => {
            const doVerseNotes = async () => {
                let ret = [];
                for (const row of ingredient
                    .filter(l => l[0] === `${systemBcv.chapterNum}:${systemBcv.verseNum}`)) {
                    let payloadLink = row[5];
                    let payloadResponse = await getText(`/burrito/ingredient/raw/${metadata.local_path}?ipath=${payloadLink.slice(2)}.md`);
                    if (payloadResponse.ok) {
                        ret.push(payloadResponse.text);
                    }
                }
                setVerseNotes(ret);
                if (!sbScriptDirSet) {
                    const dir = await TextDir(ret.toString(), 'md');
                    setTextDir(dir);
                }
            }
            doVerseNotes().then();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ingredient]
    );

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
                    {verseNotes.length > 0 && [...new Set(verseNotes)].map((v, n) => {
                        return <Accordion>
                            <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1-content"
                            id={`tword-${n}`}
                            >
                            <Typography component="span" sx={{fontWeight: "bold"}}>{v.split("##")[0].slice(2)}</Typography>
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

export default BcvArticlesViewerMuncher;
