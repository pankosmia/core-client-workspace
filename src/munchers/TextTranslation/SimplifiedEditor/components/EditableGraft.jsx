import {useRef, useState} from "react";
import {useEditable} from "use-editable";
import {updateGraftContent} from "../Controller";

export default function EditableGraft({scriptureJson, setScriptureJson, position}) {
    const [value, setValue] = useState("");
    const incomingBlock = scriptureJson.blocks[position[0]];
    const editorRef = useRef(null);
    useEditable(editorRef, setValue);
    if (!incomingBlock || !incomingBlock.content) {
        return "";
    }
    const incomingContent = incomingBlock.content[0];

    const updateScriptureJson = async (scriptureJson, position, value) =>
        setTimeout(() => {
            setScriptureJson(updateGraftContent(scriptureJson, position, value))
        }, "50");

    if (value !== incomingContent) {
        setValue(incomingContent);
    }
    if (scriptureJson.blocks[position[0]]) {
        return (
            <div style={{flexDirection: "column"}} className={incomingBlock.tag}>
                <span className="marks_title_label">{incomingBlock.tag} </span>
                <span
                    ref={editorRef}
                    style={{padding: "5px"}}
                    onBlur={() => updateScriptureJson(scriptureJson, position, value)}
                >
                {value}
            </span>
            </div>
        );
    } else {
        return "";
    }
}