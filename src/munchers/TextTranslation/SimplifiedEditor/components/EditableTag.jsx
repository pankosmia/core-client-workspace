import { useState } from 'react';
import { Menu, MenuItem } from "@mui/material";
import { updateBlockTag } from '../Controller';
export default function EditableTag({ scriptureJson, setScriptureJson, position }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const incomingBlock = scriptureJson.blocks[position[0]];
    const [value, setValue] = useState("");

    if (!incomingBlock) {
        return "";
    }
    const changeValue = (newValue) => {
        setValue(newValue)
        setScriptureJson(updateBlockTag(scriptureJson, position, newValue))
    };
    if (value !== incomingBlock.tag) {
        setValue(incomingBlock.tag);
    }
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <span
                style={{fontFamily: "monospace", fontSize: "medium", paddingRight: "1em" }}
                onClick={(event) => { setAnchorEl(event.currentTarget) }}
            >
                {value}
            </span>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={!!anchorEl}
                onClose={handleClose}
                display="inline"
            >
                {
                    ["p", "m", "li", "li2", "li3"].map((t, n) =>
                        <MenuItem
                            key={n}
                            onClick={() => { changeValue(t); handleClose() }}>
                            {t}
                        </MenuItem>
                    )
                }

            </Menu>
        </>
    );
}