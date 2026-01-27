import { useRef, useState } from "react";
import { useEditable } from "use-editable";
import { updateGraftContent } from "../Controller";

export default function EditableRemark({ scriptureJson, setScriptureJson, position }) {
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
        }, "50");

    if (firstTime && value !== incomingContent) {
        setValue(incomingContent);
        setFirstTime(false);
    }

    if (scriptureJson.blocks[position[0]]) {
        return (
            <div style={{ flexDirection: "column", fontFamily: "monospace", fontSize: "medium" }}>
                <span style={{ padding: "5px", backgroundColor: "lightgray", borderRadius: "4px 0px 0px 4px" }} > // </span>
                <span
                    contentEditable="plaintext-only"
                    ref={editorRef}
                    style={{ padding: "5px", backgroundColor: "lightgray", borderRadius: "0px 4px 4px 0px" }}
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