import React, { useState, useContext, useEffect } from "react";
import { Box, Button, MenuItem, Dialog, DialogActions, DialogTitle, DialogContent, DialogContentText, Typography, TextField } from "@mui/material";
import {
    bcvContext as BcvContext,
    i18nContext as I18nContext,
    currentProjectContext as CurrentProjectContext,
    debugContext as DebugContext,
    getJson,
    doI18n,
    postEmptyJson,
    getText
} from "pithekos-lib";

function BookPicker() {
    const { bcvRef} = useContext(BcvContext);
    const { debugRef } = useContext(DebugContext);
    const { i18nRef } = useContext(I18nContext);
    const { currentProjectRef } = useContext(CurrentProjectContext);
    const [contentBooks, setContentBooks] = useState([]);
    const [currentBook, setCurrentBook]= useState(bcvRef.current.bookCode);

    useEffect(
        () => {
            const getProjectBooks = async () => {
                if (currentProjectRef.current) {
                    const projectPath = `${currentProjectRef.current.source}/${currentProjectRef.current.organization}/${currentProjectRef.current.project}`;
                    const fullMetadataResponse = await getJson(`/burrito/metadata/summary/${projectPath}`, debugRef.current);
                    if (fullMetadataResponse.ok) {
                        setContentBooks(fullMetadataResponse.json.book_codes);
                    }
                }
            };
            getProjectBooks().then();
        },
        [currentProjectRef]
    )

    const setFirstChapter = async (b) => {
        const projectPath = `${currentProjectRef.current.source}/${currentProjectRef.current.organization}/${currentProjectRef.current.project}`;
        const usfmResponse = await getText(
            `/burrito/ingredient/raw/${projectPath}?ipath=${b}.usfm`,
            debugRef.current
        );
        if (usfmResponse.ok) {
            setCurrentBook(b);
            const usfmString = usfmResponse.text;
            const re = /\\c\s+(\d+)/;
            const match = usfmString.match(re);
            if (match) {
            const chapter = match[1];
            postEmptyJson(
                `/navigation/bcv/${b}/${chapter}/1`,
                debugRef.current
            );
        }
            }
    };

    useEffect(() => {
        setFirstChapter(currentBook);
    }, [currentBook]);

    return <Box sx={{ justifyContent: "space-between" }}>
        <div>
            <TextField
                label={`${doI18n("pages:core-local-workspace:book", i18nRef.current)}`}
                fullWidth
                id="book-button"
                size="small"
                select
                value={bcvRef.current.bookCode}
            >
                {
                    contentBooks.map((b, n) =>
                        <MenuItem
                            sx={{ maxHeight: "3rem", height: "2rem" }}
                            value={b}
                            key={n}
                            onClick={
                                () => doChapterNumbers(b)
                            }
                        >
                            {doI18n(`scripture:books:${b}`, i18nRef.current)}
                        </MenuItem>
                    )
                }
            </TextField>
        </div>
    </Box>
}

export default BookPicker;