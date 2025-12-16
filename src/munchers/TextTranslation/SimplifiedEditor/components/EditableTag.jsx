import { useContext, useState } from 'react';
import { ListItemText, Menu, MenuItem, Typography } from "@mui/material";
import { updateBlockTag } from '../Controller';
import mainBlockMenu from '../menus/main_blocks.json';
import I18nContext from 'pithekos-lib/dist/contexts/i18nContext';
import { doI18n } from 'pithekos-lib';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
export default function EditableTag({ scriptureJson, setScriptureJson, position }) {
    const { i18nRef } = useContext(I18nContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const incomingBlock = scriptureJson.blocks[position[0]];
    const [value, setValue] = useState("");
    const [subMenuAnchors, setSubMenuAnchors] = useState({});

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
                                <Typography>
                                    <ArrowRightIcon />
                                </Typography>
                            </ListItemText>
                            <Menu
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
                            onClick={() => { changeValue(t[1]); handleClose() }}>

                            {`${t[1]} - ${doI18n(t[2], i18nRef.current)}`}
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
                {value}
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