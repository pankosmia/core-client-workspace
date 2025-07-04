import {useState, useContext} from "react";
import {Box, Stack} from "@mui/material";

import {
    i18nContext as I18nContext,
    debugContext as DebugContext,
    bcvContext as BcvContext,
    doI18n,
} from "pithekos-lib";

function AudioViewer({metadata, bookCode, chapter}) {
    const overPaddedChapter = `000${chapter}`;
    const paddedChapter = overPaddedChapter.substring(overPaddedChapter.length - 3);
    console.log("paddedChapter", paddedChapter);
    return <Stack>
            <audio controls src={`/burrito/ingredient/bytes/${metadata.local_path}?ipath=${bookCode}/${bookCode}_${paddedChapter}.mp3`}></audio>
    </Stack>
}
function BcvAudioViewerMuncher({metadata}) {
    const [ingredient, setIngredient] = useState([]);
    const [verseNotes, setVerseNotes] = useState([]);
    const {systemBcv} = useContext(BcvContext);
    const {debugRef} = useContext(DebugContext);
    const {i18nRef} = useContext(I18nContext);

    return (
        <Box>
            <h5>{`${metadata.name} (${systemBcv.bookCode} ${systemBcv.chapterNum}:${systemBcv.verseNum})`}</h5>
            <h6>{doI18n("munchers:bcv_audio_viewer:title", i18nRef.current)}</h6>
            <AudioViewer metadata={metadata} bookCode={systemBcv.bookCode} chapter={systemBcv.chapterNum}/>
        </Box>
    );
}

export default BcvAudioViewerMuncher;
