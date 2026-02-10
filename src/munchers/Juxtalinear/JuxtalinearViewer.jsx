import { useEffect, useState, useContext } from "react";
import { Box, Grid2, Stack } from "@mui/material";
import Markdown from "react-markdown";

import {
  i18nContext as I18nContext,
  debugContext as DebugContext,
  bcvContext as BcvContext,
} from "pankosmia-rcl";
import { doI18n, getJson } from "pithekos-lib";

function JuxtalinearViewerMuncher({ metadata }) {
  const [ingredient, setIngredient] = useState([]);
  const { systemBcv } = useContext(BcvContext);
  const { debugRef } = useContext(DebugContext);
  const { i18nRef } = useContext(I18nContext);

  const getAllData = async () => {
    const ingredientLink = `/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.json`;
    let response = await getJson(ingredientLink, debugRef.current);
    if (response.ok) {
      setIngredient(response.json);
    } else {
      setIngredient([]);
    }
  };

  useEffect(() => {
    getAllData().then();
  }, [systemBcv]);

  const sentencesForVerse = ingredient.filter((i) =>
    i.chunks.some((c) =>
      c.source.some(
        (s) => s.cv === `${systemBcv.chapterNum}:${systemBcv.verseNum}`,
      ),
    ),
  );

  const versesInSentence = sentencesForVerse
    .map((sfv) =>
      sfv.chunks
        .map((c) => c.source.map((src) => src.cv))
        .reduce((a, b) => [...a, ...b], []),
    )
    .reduce((a, b) => [...a, ...b], []);

  const uniqueVersesInSentence = [...new Set(versesInSentence)];

  const sentencesForVerses = ingredient.filter((i) =>
    i.chunks.some((c) =>
      c.source.some((s) => uniqueVersesInSentence.includes(s.cv)),
    ),
  );

  const sentencePrintRef = `${uniqueVersesInSentence[0]}${uniqueVersesInSentence.length > 1 ? `-${uniqueVersesInSentence[uniqueVersesInSentence.length - 1].split(":")[1]}` : ""}`;

  return (
    <Stack sx={{ p: 1, alignItems: "center" }}>
      <h5>{`(${systemBcv.bookCode} ${sentencePrintRef})`}</h5>
      <div>
        {ingredient.length > 0 ? (
          <Grid2 container>
            {sentencesForVerses.map((s) => (
              <Grid2
                container
                size={12}
                spacing={0}
                sx={{ marginBottom: 1 }}
                display="flex"
              >
                {s.chunks.map((c) => (
                  <>
                    <Grid2
                      item
                      size={6}
                      spacing={0}
                      sx={{ p: 0, m: 0 }}
                      justifyContent="flex-end"
                    >
                      <Box
                        display="flex"
                        justifyContent="flex-end"
                        alignContent="flex-end"
                        alignItems="flex-end"
                        sx={{ fontSize: "small", pr: 1, textAlign: "right" }}
                      >
                        {c.source.map((s) => s.content).join(" ")}
                      </Box>
                    </Grid2>
                    <Grid2
                      item
                      size={6}
                      sx={{ fontSize: "small", pl: 1, m: 0 }}
                      spacing={0}
                    >
                      {c.gloss}
                    </Grid2>
                  </>
                ))}
              </Grid2>
            ))}
          </Grid2>
        ) : (
          "No notes found for this book"
        )}
      </div>
    </Stack>
  );
}

export default JuxtalinearViewerMuncher;
