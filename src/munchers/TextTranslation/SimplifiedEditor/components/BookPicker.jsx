import React, { useState, useContext, useEffect } from "react";
import { Box, MenuItem, TextField } from "@mui/material";
import { getJson, doI18n, postEmptyJson, getText } from "pithekos-lib";
import {
  bcvContext as BcvContext,
  i18nContext as I18nContext,
  currentProjectContext as CurrentProjectContext,
  debugContext as DebugContext,
} from "pankosmia-rcl";
function BookPicker({ json = false }) {
  const { bcvRef } = useContext(BcvContext);
  const { debugRef } = useContext(DebugContext);
  const { i18nRef } = useContext(I18nContext);
  const { currentProjectRef } = useContext(CurrentProjectContext);
  const [contentBooks, setContentBooks] = useState([]);
  const [currentBook, setCurrentBook] = useState(bcvRef.current.bookCode);

  useEffect(() => {
    const getProjectBooks = async () => {
      if (currentProjectRef.current) {
        const projectPath = `${currentProjectRef.current.source}/${currentProjectRef.current.organization}/${currentProjectRef.current.project}`;
        const fullMetadataResponse = await getJson(
          `/burrito/metadata/summary/${projectPath}`,
          debugRef.current,
        );
        if (fullMetadataResponse.ok) {
          setContentBooks(fullMetadataResponse.json.book_codes);
        }
      }
    };
    getProjectBooks().then();
  }, [currentProjectRef]);

  const setFirstChapter = async (b) => {
    const projectPath = `${currentProjectRef.current.source}/${currentProjectRef.current.organization}/${currentProjectRef.current.project}`;
    const responce = !json
      ? await getText(`/burrito/ingredient/raw/${projectPath}?ipath=${b}.usfm`)
      : await getJson(
          `/burrito/ingredient/raw/${projectPath}?ipath=${b}.json`,
          debugRef.current,
        );
    if (responce.ok) {
      if (json) {
        let [chapter, verse] =
          responce.json[0].chunks[0].source[0].cv.split(":");
        postEmptyJson(
          `/navigation/bcv/${b}/${chapter}/${verse}`,
          debugRef.current,
        );
      } else {
        setCurrentBook(b);
        const usfmString = responce.text;
        const re = /\\c\s+(\d+)/;
        const match = usfmString.match(re);
        if (match) {
          const chapter = match[1];
          postEmptyJson(`/navigation/bcv/${b}/${chapter}/1`, debugRef.current);
        }
      }
    }
  };

  useEffect(() => {
    setFirstChapter(currentBook);
  }, [currentBook]);

  return (
    <Box sx={{ justifyContent: "space-between" }}>
      <div>
        <TextField
          label={`${doI18n("pages:core-local-workspace:book", i18nRef.current)}`}
          fullWidth
          id="book-button"
          size="small"
          select
          value={bcvRef.current.bookCode}
        >
          {contentBooks.map((b, n) => (
            <MenuItem
              sx={{ maxHeight: "3rem", height: "2rem" }}
              value={b}
              key={n}
              onClick={() => setFirstChapter(b)}
            >
              {doI18n(`scripture:books:${b}`, i18nRef.current)}
            </MenuItem>
          ))}
        </TextField>
      </div>
    </Box>
  );
}

export default BookPicker;
