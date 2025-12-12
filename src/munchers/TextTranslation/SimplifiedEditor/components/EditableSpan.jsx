import {useRef, useState} from "react";
import {useEditable} from "use-editable";
import {updateUnitContent} from "../Controller";

export default function EditableSpan({scriptureJson, setScriptureJson, position}) {
    const [value, setValue] = useState("");
    const [firstTime, setFirstTime] = useState(true);
    const incomingBlock = scriptureJson.blocks[position[0]];
    const incomingContent = incomingBlock.units[position[1]].content[0];

    const updateScriptureJson = async (scriptureJson, position, value) =>
    setTimeout(() => {
                setScriptureJson(updateUnitContent(scriptureJson, position, value));
            }, "50");

    if (firstTime && value === "") {
        setFirstTime(false);
        setValue(incomingContent);
    }
    const editorRef = useRef(null);
    useEditable(editorRef, setValue);
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