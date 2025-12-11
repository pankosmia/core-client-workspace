import {useRef, useState} from "react";
import {useEditable} from "use-editable";
import {updateGraftContent} from "../Controller";

export default function EditableGraft({scriptureJson, setScriptureJson, position}) {
    const [value, setValue] = useState("");
    const [firstTime, setFirstTime] = useState(true);
    const incomingBlock = scriptureJson.blocks[position[0]];
    const incomingContent = incomingBlock.content[0];

    const updateScriptureJson = async () =>
        setTimeout(() => {
            setScriptureJson(updateGraftContent(scriptureJson, position, value))
        }, "100");

    if (firstTime) {
        setValue(incomingContent);
        setFirstTime(false);
    }
    const editorRef = useRef(null);
    useEditable(editorRef, setValue);
    return (
        <div style={{flexDirection: "column"}}>
            <span className="marks_title_label">{incomingBlock.tag} </span>
            <span
                ref={editorRef}
                onBlur={() => updateScriptureJson()}
            >
                {value}
            </span>
        </div>
    );
}