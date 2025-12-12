import { useRef, useState, useEffect } from "react";
import {useEditable} from "use-editable";
import {updateBlockTag} from "../Controller";

export default function EditableTag({scriptureJson, setScriptureJson, position}) {
    const [value, setValue] = useState("");
    const [firstTime, setFirstTime] = useState(true);
    const incomingBlock = scriptureJson.blocks[position[0]];
    const editorRef = useRef(null);
    useEditable(editorRef, setValue);
    if (!incomingBlock) {
        return "";
    }
    const incomingContent = incomingBlock.tag;
    const updateScriptureJson = async (scriptureJson, position, value) =>
        setTimeout(() => {
            setScriptureJson(updateBlockTag(scriptureJson, position, value));
        }, "50");

    if (firstTime && value !== incomingContent) {
        setValue(incomingContent);
        setFirstTime(false);
    }
    return <span ref={editorRef} style={{fontFamily: "monospace", fontSize: "medium"}} onBlur={
        (e) => {
            updateScriptureJson(scriptureJson, position, value);
        }
    }>
        {value}
    </span>
}