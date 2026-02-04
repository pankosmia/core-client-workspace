import {useEffect, useState, useContext} from "react";
import {Box, Grid2, Typography, Accordion, AccordionSummary, AccordionDetails} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Markdown from 'react-markdown';

import {
    i18nContext as I18nContext,
    debugContext as DebugContext,
    bcvContext as BcvContext,
    netContext,
    doI18n,
    getText, getJson
} from "pithekos-lib";

import TextDir from '../helpers/TextDir';

function BcvArticlesViewerMuncher({metadata}) {
    const { enabledRef } = useContext(netContext);
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
                const filteredRows = ingredient.filter(row => {
                    const reference = row[0];
                    if (!reference) return false;
                    const [chapterPart, versePart] = reference.split(':');
                    const chapter = parseInt(chapterPart);
                    if (chapter !== systemBcv.chapterNum) return false;
                    if (versePart.includes('-')) {
                        const [start, end] = versePart.split('-').map(Number);
                        return systemBcv.verseNum >= start && systemBcv.verseNum <= end;
                    } else {
                        return parseInt(versePart) === systemBcv.verseNum;
                    }
                });
                for (const row of filteredRows) {
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
        [ingredient, systemBcv.chapterNum, systemBcv.verseNum]
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
                                <Typography component="span" sx={{fontWeight: "bold"}}>{v.split("\n")[0].slice(2)}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {ingredient && <Markdown className='markdown'>{enabledRef.current ? v : v.replace(/\[([^\]]+)\]\([^\)]+\)/g, (match, p1) => `${p1} ${doI18n("pages:core-local-workspace:link_disabled_offline", i18nRef.current)}`)}</Markdown>}
                            </AccordionDetails>
                        </Accordion>
                    })}
                </Grid2>
            </Grid2>
        </Box>
    );
}

export default BcvArticlesViewerMuncher;
