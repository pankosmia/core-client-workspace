import {useRef, useState} from "react";
import {useEditable} from "use-editable";
import {updateUnitContent} from "../Controller";

export default function EditableSpan({scriptureJson, setScriptureJson, position}) {
    const incomingBlock = scriptureJson.blocks[position[0]];
    const incomingContent = incomingBlock.units[position[1]].content && incomingBlock.units[position[1]].content[0];
    const [firstTime, setFirstTime] = useState(true);
    const [value, setValue] = useState(incomingBlock);
    const editorRef = useRef(null);
    useEditable(editorRef, setValue);
    if (!incomingContent) {
        return "";
    }

    const updateScriptureJson = async (scriptureJson, position, value) =>
    setTimeout(() => {
                setScriptureJson(updateUnitContent(scriptureJson, position, value));
            }, "50");

    if (firstTime && value !== incomingContent) {
        setValue(incomingContent);
        setFirstTime(false);
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