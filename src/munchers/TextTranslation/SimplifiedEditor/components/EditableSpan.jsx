import { useContext, useRef, useState } from "react";
import { useEditable } from "use-editable";
import { updateUnitContent } from "../Controller";
import { postEmptyJson } from "pithekos-lib";
import DebugContext from "pithekos-lib/dist/contexts/debugContext";
import BcvContext from "pithekos-lib/dist/contexts/bcvContext";

export default function EditableSpan({ scriptureJson, setScriptureJson, position, chapter, verse }) {
    const incomingBlock = scriptureJson.blocks[position[0]];
    const incomingContent = incomingBlock.units[position[1]].content && incomingBlock.units[position[1]].content[0];
    const [firstTime, setFirstTime] = useState(true);
    const [value, setValue] = useState(incomingContent || '');
    const { debugRef } = useContext(DebugContext);
    const { systemBcv } = useContext(BcvContext);
    const editorRef = useRef(null);
    useEditable(editorRef, setValue);
    if (!incomingContent) {
        return "";
    }
    console.log("value",`"${value}"`);
    const updateScriptureJson = async (scriptureJson, position, value) =>
        setTimeout(() => {
            setScriptureJson(updateUnitContent(scriptureJson, position, value));
        }, "200");

    if (firstTime && value !== incomingContent) {
        setValue(incomingContent);
        setFirstTime(false);
    }
    return <span
        ref={editorRef}
        className="span_edit_verses"
        style={{minWidth:"1em",border:value.trim()==="" ? "solid black 1px" : "none"}}
        onBlur={
            (e) => {
                updateScriptureJson(scriptureJson, position, value);
            }
        }
        onFocus={() => {
            postEmptyJson(
                `/navigation/bcv/${systemBcv.bookCode}/${chapter}/${verse}`,
                debugRef.current
            );
        }}
    >
        {value}
    </span>
}