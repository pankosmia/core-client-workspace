import {useState} from 'react';
import {Menu, MenuItem} from "@mui/material";
export default function EditableTag({scriptureJson, setScriptureJson, position}) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [value, setValue] = useState("p");
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <span
                style={{fontFamily: "monospace", fontSize: "medium", paddingRight: "1em"}}
                onClick={handleClick}
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
                    ["p", "m", "li", "li2", "li3"].map((t, n) => <MenuItem key={n} onClick={() => {setValue(t); handleClose()}}>{t}</MenuItem>)
                }

            </Menu>
        </>
    );
}