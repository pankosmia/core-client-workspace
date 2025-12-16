import { useContext, useState } from 'react';
import { ListItemText, Menu, MenuItem } from "@mui/material";
import { updateBlockTag } from '../Controller';
import mainBlockMenu from '../menus/main_blocks.json';
import introductionBlockMenu from '../menus/intro_blocks.json';
import titleBlockMenu from '../menus/title_blocks.json';
import headingBlockMenu from '../menus/heading_blocks.json';
import introduction_titleBlockMenu from '../menus/intro_title_blocks.json'
import introduction_headingBlockMenu from '../menus/intro_heading_blocks.json'
import I18nContext from 'pithekos-lib/dist/contexts/i18nContext';
import { doI18n } from 'pithekos-lib';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
export default function EditableTag({ scriptureJson, setScriptureJson, position }) {
    const { i18nRef } = useContext(I18nContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const incomingBlock = scriptureJson.blocks[position[0]];
    const [value, setValue] = useState("");
    const [subMenuAnchors, setSubMenuAnchors] = useState({});

    const menuStructures = { "main": mainBlockMenu, "introduction": introductionBlockMenu,"introduction_title":introduction_titleBlockMenu, "introduction_heading":introduction_headingBlockMenu, "title": titleBlockMenu, "heading": headingBlockMenu }

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
                        <MenuItem
                            key={n}
                            dense
                            MenuListProps={{
                                onmouseenter,
                                onmouseleave
                            }}
                        >
                            <ListItemText
                                onClick={(e) =>
                                    setSubMenuAnchors({ ...anchors, [n]: e.currentTarget })
                                }
                            >
                                {doI18n(t[1], i18nRef.current)}
                                <ArrowRightIcon style={{ marginLeft: "2px" }} />
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
                            onClick={() => { changeValue(t[1]); handleClose() }}
                            dense>

                            {`${t[1]} - ${doI18n(t[2], i18nRef.current)}`}
                        </MenuItem>
                    )
                }
            })
        )
    }
    function doSelectedMenu(b) {

        switch (b.type) {

            case "introduction":
                if(b.tag === "is"){
                    return doMenu(menuStructures.introduction_heading)
                } 
                if (b.tag.startsWith("imt")){
                    return doMenu(menuStructures.introduction_title)
                } 
                return doMenu(menuStructures.introduction)


            case "main":
                return doMenu(menuStructures.main)

            case "heading":
                return doMenu(menuStructures.heading)

            case "title":
                return doMenu(menuStructures.title)

            default:
                return null;
        }
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

                {
                    doSelectedMenu(incomingBlock)
                }

            </Menu>
        </>
    );
}