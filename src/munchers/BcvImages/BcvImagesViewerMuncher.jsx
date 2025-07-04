import {useEffect, useState, useContext} from "react";
import {Box, Stack} from "@mui/material";

import {
    i18nContext as I18nContext,
    debugContext as DebugContext,
    bcvContext as BcvContext,
    doI18n,
    getText
} from "pithekos-lib";

function ImageViewer({metadata, reference}) {
    return <Stack>
        <img
            src={`/burrito/ingredient/bytes/${metadata.local_path}?ipath=${reference.slice(2)}.jpg`}
            alt="resource image"
        />
    </Stack>
}
function BcvImagesViewerMuncher({metadata}) {
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
                    ret.push(row[6]);
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
                        verseNotes.length > 0 ? verseNotes.map((v, n) => <ImageViewer key={n} metadata={metadata} reference={v}/>) : "No notes found for this verse"
                    }
            </div>
        </Box>
    );
}

export default BcvImagesViewerMuncher;
