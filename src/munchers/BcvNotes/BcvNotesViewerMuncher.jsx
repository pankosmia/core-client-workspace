import { useEffect, useState, useContext } from "react";
import {
  Box,
  Grid2,
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Markdown from "react-markdown";

import {
  i18nContext as I18nContext,
  debugContext as DebugContext,
  bcvContext as BcvContext,
} from "pankosmia-rcl";
import { doI18n, getText } from "pithekos-lib";
import TextDir from "../helpers/TextDir";

function BcvNotesViewerMuncher({ metadata }) {
  const [ingredient, setIngredient] = useState([]);
  const [textDir, setTextDir] = useState(
    metadata?.script_direction
      ? metadata.script_direction.toLowerCase()
      : undefined,
  );

  const { systemBcv } = useContext(BcvContext);
  const { debugRef } = useContext(DebugContext);
  const { i18nRef } = useContext(I18nContext);

  const sbScriptDir = metadata?.script_direction
    ? metadata.script_direction.toLowerCase()
    : undefined;
  const sbScriptDirSet = sbScriptDir === "ltr" || sbScriptDir === "rtl";

  const getAllData = async () => {
    const ingredientLink = `/api/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.tsv`;
    let response = await getText(ingredientLink, debugRef.current);
    if (response.ok) {
      setIngredient(
        response.text
          .split("\n")
          .map((l) => l.split("\t").map((f) => f.replace(/\\n/g, "\n\n"))),
      );
      if (!sbScriptDirSet) {
        const dir = await TextDir(response.text, "md");
        setTextDir(dir);
      }
    } else {
      setIngredient([]);
    }
  };

  useEffect(
    () => {
      getAllData().then();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [systemBcv],
  );

  const cvInRange = (cv, range) => {
    const [cvC, cvV] = cv.split(":");
    const [rangeC, rangeV] = range.split(":");
    if (cvC !== rangeC) {
      return false;
    }
    const parseVals = (str) => str.split("-").map(Number);

    const [cvFrom, cvTo = cvFrom] = parseVals(cvV);
    const [rangeFrom, rangeTo = rangeFrom] = parseVals(rangeV);

    return cvFrom <= rangeTo && cvTo >= rangeFrom;
  };

  const filteredIngredient = ingredient.filter((l) => {
    return cvInRange(
      `${systemBcv.chapterNum}:${systemBcv.verseNum}${systemBcv.endVerseNum ? `-${systemBcv.endVerseNum}` : ""}`,
      l[0],
    );
  });

  const verseNotes = filteredIngredient.map((l) => l[6] || l[5]);
  const verseIds = filteredIngredient.map((l) => l[1]);
  /* const verseSupReferences = filteredIngredient.map((l) => l[3]); */

  // If SB does not specify direction then it is set here, otherwise it has already been set per SB in WorkspaceCard
  return (
    <Box sx={{ flexGrow: 1 }} dir={!sbScriptDirSet ? textDir : undefined}>
      <Grid2
        container
        direction="row"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Grid2 item size={12}>
          {verseNotes.length > 0 &&
            [...new Set(verseNotes)].map((v, n) => {
              const currentIngredient = filteredIngredient.filter((v) =>
                v.includes(verseIds[n]),
              )[0];
              const currentTitle = currentIngredient[0];
              const currentNote =
                currentIngredient[6] || currentIngredient[5] || "";
              const currentId = currentIngredient[1];
              const currentSupReference = currentIngredient[3] || "";

              return (
                <Accordion
                  key={`${systemBcv.chapterNum}:${systemBcv.verseNum}${systemBcv.endVerseNum ? `-${systemBcv.endVerseNum}` : ""}-${n}`}
                  defaultExpanded={n === 0}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id={`tnote-${n}`}
                  >
                    <Typography component="span" sx={{ fontWeight: "bold" }}>
                      {currentTitle}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {ingredient && (
                      <Markdown className="markdown">
                        {verseNotes.length > 0 ? (
                          `* (**${currentId}**) ${currentNote.replace(". \n\n\n\n ", ". \n\n * ")}${!(currentSupReference === "") ? ` (${currentSupReference.replace("rc://*/ta/man/translate/", "")})` : ""}`
                        ) : (
                          <Typography>
                            {doI18n(
                              "pages:core-local-workspace:no_verse",
                              i18nRef.current,
                            )}
                          </Typography>
                        )}
                      </Markdown>
                    )}
                  </AccordionDetails>
                </Accordion>
              );
            })}
        </Grid2>
      </Grid2>
    </Box>
  );
}

export default BcvNotesViewerMuncher;
