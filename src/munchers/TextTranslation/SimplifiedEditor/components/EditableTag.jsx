import { useState } from 'react';
import { Menu, MenuItem } from "@mui/material";
import { updateBlockTag } from '../Controller';
import mainBlockMenu from '../menus/main_blocks.json';

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
    console.log("jsonMain", mainBlockMenu);

    function doMenu(menuSpec) {
        return (
            menuSpec.map((t, n) => {
                if (t[0] === 'submenu') {
                    console.log("map 1")
                    return (
                        <Menu
                            key={n}
                            open={true}
                        >
                            {doMenu(t[2])}
                        </Menu>
                    )
                }
                else {
                    console.log("map 2")
                    return (
                        <MenuItem
                            key={n}
                            onClick={() => { changeValue(t); handleClose() }}>
                            {t[1]}
                        </MenuItem>
                    )
                }

            })
        )

    }
    //console.log(doMenu())


    return (
        <>
            <span
                style={{ fontFamily: "monospace", fontSize: "medium", paddingRight: "1em" }}
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

                    doMenu(mainBlockMenu)
                }

            </Menu>
        </>
    );
}