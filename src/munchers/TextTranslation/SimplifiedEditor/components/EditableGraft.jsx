import {useRef, useState} from "react";
import {useEditable} from "use-editable";
import {updateGraftContent} from "../Controller";
import EditableTag from "./EditableTag";

export default function EditableGraft({scriptureJson, setScriptureJson, position}) {
    const [value, setValue] = useState("");
    const [firstTime, setFirstTime] = useState(true);
    const incomingBlock = scriptureJson.blocks ? scriptureJson.blocks[position[0]] : null;
    const editorRef = useRef(null);
    useEditable(editorRef, setValue);
    if (!incomingBlock || !incomingBlock.content) {
        return "";
    }
    const incomingContent = incomingBlock.content[0];

    const updateScriptureJson = async (scriptureJson, position, value) =>
        setTimeout(() => {
                setScriptureJson(updateGraftContent(scriptureJson, position, value))
            },
            200
        );

    if (firstTime && value !== incomingContent) {
        setValue(incomingContent);
        setFirstTime(false);
    }
    if (scriptureJson.blocks[position[0]]) {
        return (
            <div>
                <EditableTag scriptureJson={scriptureJson} setScriptureJson={setScriptureJson}
                             position={position}/>
                <span
                    contentEditable="plaintext-only"
                    className={`span_edit_graft ${incomingBlock.tag}`}
                    ref={editorRef}
                    style={
                        {
                            paddingRight: value.trim() === "" ? "20px" : "0",
                            backgroundColor: value.trim() === "" ? "#CCC" : "#FFF",
                        }
                    }
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