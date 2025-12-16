import { useState } from 'react';
import { ListItemText, Menu, MenuItem } from "@mui/material";
import { updateBlockTag } from '../Controller';
import mainBlockMenu from '../menus/main_blocks.json';

export default function EditableTag({ scriptureJson, setScriptureJson, position }) {
    const [anchorEl, setAnchorEl] = useState(null);
    console.log("anchorEl",anchorEl);
    const incomingBlock = scriptureJson.blocks[position[0]];
    const [value, setValue] = useState("");
    console.log("value",value);
    const [subMenuAnchors, setSubMenuAnchors] = useState({});
    console.log("submenu", subMenuAnchors);
    if (!incomingBlock) {
        return "";
    }
    const changeValue = (newValue) => {
        setValue(newValue)
        setScriptureJson(updateBlockTag(scriptureJson, position, newValue))
    };

    const changeValueAnchor = (anchors, n) => {

        setSubMenuAnchors({ ...anchors, [n]: null })
    };

    if (value !== incomingBlock.tag) {
        setValue(incomingBlock.tag);
    }
    const handleClose = () => {
        setAnchorEl(null);
    };
    console.log("jsonMain",mainBlockMenu)
    function doMenu(menuSpec, anchors = {}) {
        return (
            menuSpec.map((t, n) => {
                if (t[0] === 'submenu') {
                    return (
                        <MenuItem key={n}>
                            <ListItemText
                                onClick={(e) =>
                                    setSubMenuAnchors({ ...anchors, [n]: e.currentTarget })
                                }
                            >
                                {t[1]}
                            </ListItemText>
                            <Menu
                                anchorEl={subMenuAnchors[2]}
                                open={Boolean(subMenuAnchors[n])}
                                onClose={() =>
                                    changeValueAnchor()
                                }
                            >
                                {doMenu(t[2], anchors)}
                            </Menu>
                        </MenuItem>
                    )
                }
                else {
                    return (
                        <MenuItem
                            key={n}
                            onClick={() => { changeValue(t); handleClose() }}>
                            {`${t[1]} - ${t[2]}`}
                        </MenuItem>
                    )
                }
            })
        )
    }

    return (
        <>
            <span
                style={{ fontFamily: "monospace", fontSize: "medium", paddingRight: "1em" }}
                onClick={(event) => { setAnchorEl(event.currentTarget) }}
            >
                {value} TEST
            </span>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={!!anchorEl}
                onClose={handleClose}
                display="inline"
            >
                {doMenu(mainBlockMenu)}
            </Menu>
        </>
    );
}