import {useRef, useState} from "react";
import {useEditable} from "use-editable";
import {updateUnitContent} from "../Controller";

export default function EditableSpan({scriptureJson, setScriptureJson, position}) {
    const [value, setValue] = useState("");
    const [firstTime, setFirstTime] = useState(true);
    const incomingBlock = scriptureJson.blocks[position[0]];
    const incomingContent = incomingBlock.units[position[1]].content[0];

    const updateScriptureJson = async () =>
    setTimeout(() => {
                setScriptureJson(updateUnitContent(scriptureJson, position, value))
            }, "100");

    if (firstTime && value === "") {
        setValue(incomingContent);
        setFirstTime(false);
    }
    const editorRef = useRef(null);
    useEditable(editorRef, setValue);
    return <span
        ref={editorRef}
        onBlur={
            (e) => {
                updateScriptureJson();
            }
        }
    >
        {value}
    </span>
}