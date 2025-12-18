import {useContext, useRef, useState} from "react";
import {useEditable} from "use-editable";
import {updateUnitContent} from "../Controller";
import {postEmptyJson} from "pithekos-lib";
import DebugContext from "pithekos-lib/dist/contexts/debugContext";
import BcvContext from "pithekos-lib/dist/contexts/bcvContext";

export default function EditableSpan({scriptureJson, setScriptureJson, position, chapter, verse}) {
    const incomingBlock = scriptureJson.blocks[position[0]];
    const incomingContent = incomingBlock.units[position[1]].content ? incomingBlock.units[position[1]].content[0] : null;
    const [firstTime, setFirstTime] = useState(true);
    const [value, setValue] = useState(incomingContent || '');
    const {debugRef} = useContext(DebugContext);
    const {systemBcv} = useContext(BcvContext);
    const editorRef = useRef(null);
    useEditable(editorRef, setValue);

    const updateScriptureJson = async (scriptureJson, position, value) =>
        setTimeout(() => {
                setScriptureJson(updateUnitContent(scriptureJson, position, value));
            },
            100);

    const updateBcv = async (b, c, v) =>
        setTimeout(() => {
                postEmptyJson(
                    `/navigation/bcv/${b}/${c}/${v}`,
                    debugRef.current
                );
            },
            200);

    if (incomingContent === null) {
        return "";
    }

    if (firstTime && incomingContent !== null) {
        setValue(incomingContent);
        setFirstTime(false);
    }
    return <span
        ref={editorRef}
        className="span_edit_verses"
        style={{minWidth: "1em", border: value.trim() === "" ? "solid black 1px" : "none"}}
        onBlur={
            (e) => {
                updateScriptureJson(scriptureJson, position, value);
            }
        }
        onFocus={() => {
            updateBcv(systemBcv.bookCode, chapter, verse)
        }}
    >
        {value}
    </span>
}