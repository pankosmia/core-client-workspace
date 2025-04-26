import React, {useState, useContext} from "react";
import {Box, TextField, Typography} from "@mui/material";
import {
    bcvContext as BcvContext,
    i18nContext as I18nContext,
    doI18n,
    postEmptyJson,
} from "pithekos-lib";

function BcvPicker() {
    const [newRef, setNewRef] = useState("");
    const {bcvRef} = useContext(BcvContext);
    const {i18nRef} = useContext(I18nContext);
    const isValid = newRef.length === 3 && newRef.trim().toUpperCase() === newRef;
    return <Box>
        <Typography variant="h6">{bcvRef.current.bookCode}</Typography>
        <TextField
            sx={{backgroundColor: isValid ? "#DFD" : "#FDD"}}
            id="outlined-basic"
            label={doI18n("components:header:new_reference", i18nRef.current)}
            size="small"
            variant="outlined"
            value={newRef}
            onChange={
                e => {
                    const v = e.target.value;
                    setNewRef(v);
                }
            }
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    if (isValid) {
                        postEmptyJson(`/navigation/bcv/${newRef}/1/1`);
                    }
                    setNewRef("");
                    e.preventDefault();
                }
            }}
        />
    </Box>
}

export default BcvPicker;