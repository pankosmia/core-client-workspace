import React, { useState, useContext, useEffect } from "react";
import { Box, Button, MenuItem, Menu, Dialog, DialogActions, DialogTitle, DialogContent, DialogContentText, Typography, Stack } from "@mui/material";
import {
    bcvContext as BcvContext,
    i18nContext as I18nContext,
    currentProjectContext as CurrentProjectContext,
    debugContext as DebugContext,
    getJson,
    doI18n,
    postEmptyJson,
    debugContext,
    bcvContext,
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

    const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
    const menuIsOpen = Boolean(menuAnchorEl);
    const [book, setBook] = useState('');
    const [dialogIsOpen, setDialogIsOpen] = useState(false);

    const handleMenuOpen = (target) => {
        setMenuAnchorEl(target);
    };
    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };
    const handleDialogOpen = (b) => {
        handleMenuClose();
        setBook(b);
        setDialogIsOpen(true);
    };
    const handleDialogClose = () => {
        setDialogIsOpen(false);
        setBook('');
    };
    const handleChangeBook = (b) => {
        postEmptyJson(`/navigation/bcv/${b}/1/1`, debugContext.current).then();
        handleDialogClose();
    };

    return <Box sx={{ display: 'flex', flexDirection: 'column', width:"200px" }}>
      <Stack direction="row">
        <Box sx={{ m: 0 , display:"inline-block"}}>
            <Button
                id="book-button"
                variant="contained"
                size="small"
                aria-controls={menuIsOpen ? 'book-button-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={menuIsOpen ? 'true' : undefined}
                onClick={event => handleMenuOpen(event.currentTarget)}
                sx={{ backgroundColor: "#E0E0E0", color: "#000", ml: 4 }}
            >
                {doI18n(`scripture:books:${bcvRef.current.bookCode}`, i18nRef.current)}
            </Button>
            <Menu
                id="basic-menu"
                anchorEl={menuAnchorEl}
                open={menuIsOpen}
                onClose={() => handleMenuClose()}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                {
                    contentBooks.map((b, n) =>
                        <MenuItem
                            key={n}
                            disabled={b === (bcvRef.current && bcvRef.current.bookCode)}
                            onClick={
                                () => handleDialogOpen(b)
                            }
                        >
                            {doI18n(`scripture:books:${b}`, i18nRef.current)}
                        </MenuItem>
                    )
                }
            </Menu>
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
        <Button
          variant="contained"
          size="small"
          sx={{ backgroundColor: "#E0E0E0", color: "#000", ml: 1 }}
        >
          hello
        </Button>
      </Stack>
    </Box>
}

export default BcvPicker;