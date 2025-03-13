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
    return <Box>
        <Typography variant="h6">{`${bcvRef.current.book_code} ${bcvRef.current.chapter}:${bcvRef.current.verse}`}</Typography>
        <TextField
            sx={{backgroundColor: "#DDCCEE"}}
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
                    const [bookCode, cv] = newRef.split(" ");
                    if (bookCode && cv && bookCode.length === 3) {
                        let [c, v] = cv.split(":");
                        if (c && v) {
                            c = parseInt(c);
                            v = parseInt(v);
                            if (typeof c === "number" && typeof v === "number" && c>0 && v > 0 && c <= 150 && v <= 176) {
                                postEmptyJson(`/navigation/bcv/${bookCode}/${c}/${v}`);
                            }
                        }
                    }
                    setNewRef("");
                    e.preventDefault();
                }
            }}
        />
    </Box>
}

export default BcvPicker;