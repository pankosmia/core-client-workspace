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
    debugContext,
} from "pithekos-lib";

function BcvPicker() {
    const { bcvRef } = useContext(BcvContext);
    const { debugRef } = useContext(DebugContext);
    const { i18nRef } = useContext(I18nContext);
    const { currentProjectRef } = useContext(CurrentProjectContext);
    const [contentBooks, setContentBooks] = useState([]);

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

    const [book, setBook] = useState('');
    const [dialogIsOpen, setDialogIsOpen] = useState(false);

    const handleDialogClose = () => {
        setDialogIsOpen(false);
        setBook('');
    };
    const handleChangeBook = (b) => {
        postEmptyJson(`/navigation/bcv/${b}/1/1`, debugContext.current).then();
        handleDialogClose();
    };

    return <Box sx={{ justifyContent: "space-between" }}>
        <div>
            <TextField
                fullWidth
                id="book-button"
                size="small"
                select
                value={bcvRef.current.bookCode}
            >
                {
                    contentBooks.map((b, n) =>
                        <MenuItem
                            sx={{maxHeight:"3rem", height:"2rem"}}
                            value={b}
                            key={n}
                            onClick={
                                () => handleChangeBook(b)
                            }
                        >
                            {doI18n(`scripture:books:${b}`, i18nRef.current)}
                        </MenuItem>
                    )
                }
            </TextField>
        </div>

        <Dialog
            open={dialogIsOpen}
            onClose={handleDialogClose}
            slotProps={{
                paper: {
                    component: 'form',
                },
            }}
        >
            <DialogTitle><b>{doI18n("pages:core-local-workspace:change_book", i18nRef.current)}</b></DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <Typography>
                        {doI18n("pages:core-local-workspace:change_book_question", i18nRef.current)}
                    </Typography>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDialogClose}>{doI18n("pages:core-local-workspace:cancel", i18nRef.current)}</Button>
                <Button onClick={() => {
                    handleChangeBook(book);
                }}>{doI18n("pages:core-local-workspace:accept", i18nRef.current)}</Button>
            </DialogActions>
        </Dialog>
    </Box>
}

export default BcvPicker;