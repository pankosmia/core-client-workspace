import {useEffect, useState, useContext} from "react";
import {Box} from "@mui/material";
import Markdown from 'react-markdown';

import {
    i18nContext as I18nContext,
    debugContext as DebugContext,
    bcvContext as BcvContext,
    doI18n,
    getText, getJson
} from "pithekos-lib";

function BcvArticlesViewerMuncher({metadata}) {
    const [ingredient, setIngredient] = useState([]);
    const [verseNotes, setVerseNotes] = useState([]);
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
            setIngredient([]);
        }
    };

    useEffect(
        () => {
            getAllData().then();
        },
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
            }
            doVerseNotes().then();
        },
        [ingredient]
    );
    return (
        <Box>
            <h5>{`${metadata.name} (${systemBcv.bookCode} ${systemBcv.chapterNum}:${systemBcv.verseNum})`}</h5>
            <h6>{doI18n("munchers:bcv_notes_viewer:title", i18nRef.current)}</h6>
            <div>
                {ingredient &&
                    <Markdown>{
                        verseNotes.length > 0 ? verseNotes.join("\n***\n") : "No notes found for this verse"
                    }</Markdown>}
            </div>
        </Box>
    );
}

export default BcvArticlesViewerMuncher;
