import { useState, useContext, useEffect } from "react";
import { Box, MenuItem, TextField, Tooltip } from "@mui/material";
import md5sum from "md5";
import {
    bcvContext as BcvContext,
    i18nContext as I18nContext,
    currentProjectContext as CurrentProjectContext,
    debugContext as DebugContext,
    getJson,
    doI18n,
    postEmptyJson,
    getText,
} from "pithekos-lib";

function BcvPicker({ md5sumScriptureJson, scriptureJson }) {
    const { bcvRef } = useContext(BcvContext);
    const { debugRef } = useContext(DebugContext);
    const { i18nRef } = useContext(I18nContext);
    const { currentProjectRef } = useContext(CurrentProjectContext);
    const [contentBooks, setContentBooks] = useState([]);
    const [currentBook, setCurrentBook] = useState(bcvRef.current.bookCode);
    const isDisabled = md5sum(JSON.stringify(scriptureJson)) !== md5sumScriptureJson

    useEffect(
        () => {
            const getProjectBooks = async () => {
                if (currentProjectRef.current) {
                    const projectPath = `${currentProjectRef.current.source}/${currentProjectRef.current.organization}/${currentProjectRef.current.project}`;
                    const fullMetadataResponse = await getJson(`/burrito/metadata/raw/${projectPath}`, debugRef.current);
                    if (fullMetadataResponse.ok) {
                        setContentBooks(
                            Object.entries(fullMetadataResponse.json.ingredients)
                                .map(
                                    i =>
                                        Object.keys(i[1].scope || {})
                                )
                                .reduce(
                                    (a, b) => [...a, ...b],
                                    []
                                )
                        );
                    }
                }
            };
            getProjectBooks().then();
        },
        [currentProjectRef]
    )

    const doChapterNumbers = async (b) => {
        const projectPath = `${currentProjectRef.current.source}/${currentProjectRef.current.organization}/${currentProjectRef.current.project}`;
        const usfmResponse = await getText(
            `/burrito/ingredient/raw/${projectPath}?ipath=${b}.usfm`,
            debugRef.current
        );
        setCurrentBook(b);
        if (usfmResponse.ok) {
            const usfmString = usfmResponse.text;
            const re = /\\c\s+(\d+)/;
            const match = usfmString.match(re);
            const chapter = match[1];
            postEmptyJson(
                `/navigation/bcv/${b}/${chapter}/1`,
                debugRef.current
            );

        }
    };

    useEffect(() => {
        doChapterNumbers(currentBook);
    }, [currentBook]);

    return (
        <Box sx={{ justifyContent: "space-between" }}>
            <div>
                <Tooltip title={isDisabled ? `${doI18n("pages:core-local-workspace:disabled_bcvPicker", i18nRef.current)}` : ""}>
                    <TextField
                        label={`${doI18n("pages:core-local-workspace:book", i18nRef.current)}`}
                        fullWidth
                        id="book-button"
                        size="small"
                        select
                        value={bcvRef.current.bookCode}
                        disabled={isDisabled}
                    >
                        {
                            contentBooks.map((b, n) =>
                                <MenuItem
                                    sx={{ maxHeight: "3rem", height: "2rem" }}
                                    value={b}
                                    key={n}
                                    onClick={
                                        () => { doChapterNumbers(b) }
                                    }
                                >
                                    {doI18n(`scripture:books:${b}`, i18nRef.current)}
                                </MenuItem>
                            )
                        }
                    </TextField>
                </Tooltip>
            </div>
        </Box>
    )
}

export default BcvPicker;