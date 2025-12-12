import {useRef, useState} from "react";
import {useEditable} from "use-editable";
import {updateUnitContent} from "../Controller";

export default function EditableSpan({scriptureJson, setScriptureJson, position}) {
    const [value, setValue] = useState("");
    const incomingBlock = scriptureJson.blocks[position[0]];
    const editorRef = useRef(null);
    useEditable(editorRef, setValue);
    if (!incomingBlock.units[position[1]].content) {
        return "";
    }
    const incomingContent = incomingBlock.units[position[1]].content[0];

    const updateScriptureJson = async (scriptureJson, position, value) =>
    setTimeout(() => {
                setScriptureJson(updateUnitContent(scriptureJson, position, value));
            }, "50");

    if (value !== incomingContent) {
        setValue(incomingContent);
    }
    
    return <span
        ref={editorRef}
        style={{padding: "5px"}}
        onBlur={
            (e) => {
                updateScriptureJson(scriptureJson, position, value);
            }
        }
    >
        {value}
    </span>
}