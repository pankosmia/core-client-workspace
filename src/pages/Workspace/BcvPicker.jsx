import React, {useState, useContext, useEffect} from "react";
import {Box, Button, MenuItem, Menu} from "@mui/material";
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
    const {bcvRef} = useContext(BcvContext);
    const {debugRef} = useContext(DebugContext);
    const {i18nRef} = useContext(I18nContext);
    const {currentProjectRef} = useContext(CurrentProjectContext);
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

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    return <Box sx={{m: 0}}>
        <Button
            id="book-button"
            variant="contained"
            size="small"
            aria-controls={open ? 'book-button-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={event => setAnchorEl(event.currentTarget)}
            sx={{backgroundColor: "#E0E0E0", color: "#000", ml: 4}}
        >
            {doI18n(`scripture:books:${bcvRef.current.bookCode}`, i18nRef.current)}
        </Button>
        <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={() => setAnchorEl(null)}
            MenuListProps={{
                'aria-labelledby': 'basic-button',
            }}
        >
            {
                contentBooks.map((b, n) =>
                    <MenuItem
                        key={n}
                        disabled={b === (!bcvRef.current && bcvRef.current.bookCode)}
                        onClick={
                            () => {
                                postEmptyJson(`/navigation/bcv/${b}/1/1`, debugContext.current)
                                    .then(() => setAnchorEl(null));
                            }
                        }
                    >
                        {doI18n(`scripture:books:${b}`, i18nRef.current)}
                    </MenuItem>
                )
            }
        </Menu>
    </Box>
}

export default BcvPicker;