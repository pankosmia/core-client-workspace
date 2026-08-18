import { useEffect, useState, useContext } from "react";
import {
  Box,
  Grid,
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
import { getText } from "pankosmia-lib/http";
import { doI18n } from "pankosmia-lib/i18n";
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

  const groupedByReference = filteredIngredient.reduce((acc, item) => {
    const ref = item[0];
    if (!acc[ref]) {
      acc[ref] = [];
    }
    acc[ref].push(item);
    return acc;
  }, {});

  const groupedEntries = Object.entries(groupedByReference);

  return (
    <Box sx={{ flexGrow: 1 }} dir={!sbScriptDirSet ? textDir : undefined}>
      <Grid
        container
        direction="row"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Grid item size={12}>
          {groupedEntries.length > 0 &&
            groupedEntries.map(([reference, items], n) => {
              const notesContent = items
                .map((item) => {
                  const noteId = item[1];
                  const noteText = (item[6] || item[5] || "").trimStart();
                  const supReference = item[3] || "";
                  return `* (**${noteId}**) ${noteText.replace(". \n\n\n\n ", ". \n\n * ")}${supReference !== "" ? ` (${supReference.replace("rc://*/ta/man/translate/", "")})` : ""}`.trim();
                })
                .join("\n");

              return (
                <Accordion key={`${reference}-${n}`} defaultExpanded={n === 0}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel${n}-content`}
                    id={`tnote-${n}`}
                  >
                    <Typography component="span" sx={{ fontWeight: "bold" }}>
                      {reference}
                      {/* Below is the code for showing the id when there's only 1 item, but it looks very weird. */}
                      {/* {items.length === 1 ? `${reference} ${items[0][1]}` : reference} */}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {ingredient && (
                      <Markdown className="markdown">
                        {notesContent ||
                          doI18n(
                            "pages:core-local-workspace:no_verse",
                            i18nRef.current,
                          )}
                      </Markdown>
                    )}
                  </AccordionDetails>
                </Accordion>
              );
            })}
        </Grid>
      </Grid>
    </Box>
  );
}

export default BcvNotesViewerMuncher;
