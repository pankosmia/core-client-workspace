import {useRef, useState} from "react";
import {useEditable} from "use-editable";
import {updateGraftContent} from "../Controller";

export default function EditableGraft({scriptureJson, setScriptureJson, position}) {
    const [value, setValue] = useState("");
    const [firstTime, setFirstTime] = useState(true);
    const incomingBlock = scriptureJson.blocks[position[0]];
    const incomingContent = incomingBlock.content[0];
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
                className={incomingBlock.tag}
                ref={editorRef}
                onBlur={() => setScriptureJson(updateGraftContent(scriptureJson, position, value))}
            >
                {value}
            </span>
        </div>
    );
}