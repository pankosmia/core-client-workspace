import {useEffect, useState, useContext} from "react";
import {Box, Grid, Typography} from "@mui/material";

import {
    i18nContext as I18nContext,
    debugContext as DebugContext,
    bcvContext as BcvContext,
    netContext as NetContext,
    getText,
    doI18n
} from "pithekos-lib";

function VideoLinksViewerMuncher({metadata}) {
    const [ingredient, setIngredient] = useState([]);
    const [verseNotes, setVerseNotes] = useState([]);
    const {enableNet} = useContext(NetContext);
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
    }

    useEffect(
        () => {
            getAllData().then();
        },
        [systemBcv]
    );

    useEffect(
        () => {
            setVerseNotes(
                ingredient
                    .filter(l => l[0] === `${systemBcv.chapterNum}:${systemBcv.verseNum}`)
                    .map(l => l[5])
            );
        },
        [ingredient, systemBcv]
    );

    return (
        <Box>
            <Typography variant="h5">
                {`${metadata.name} (${systemBcv.bookCode} ${systemBcv.chapterNum}:${systemBcv.verseNum})`}
            </Typography>
            <Typography variant="h6">{doI18n("munchers:video_links_viewer:title", i18nRef.current)}</Typography>
            <Grid container spacing={2}>
              {verseNotes.length === 0 && doI18n("munchers:video_links_viewer:no_content", i18nRef.current)}
              {
                  verseNotes.length > 0 && enableNet &&
                      verseNotes.map(
                          note =>
                              <Grid size={6}>
                                  <video width="320" height="240" controls>
                                      <source src={note} type="video/mp4"/>
                                      {doI18n("munchers:video_links_viewer:offline_mode", i18nRef.current)}
                                  </video>
                              </Grid>
                      ) 
              }
              {
                  verseNotes.length > 0 && !enableNet && <b>Offline Mode</b>
              }
            </Grid>
        </Box>
    );
}

export default VideoLinksViewerMuncher;
