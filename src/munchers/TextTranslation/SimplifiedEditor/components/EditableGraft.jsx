import { useRef, useState } from "react";
import {useEditable} from "use-editable";

export default function EditableGraft({ block }) {
    const [value, setValue] = useState("");
    if (block.content[0] !== value) {
        setValue(block.content[0]);
    }
    const editorRef = useRef(null);
    useEditable(editorRef, setValue);
    return (
        <div style={{ flexDirection: "column" }}>
            <span className="marks_title_label">{block.tag} </span>
            <span className={block.tag} ref={editorRef}>{value}</span>
        </div>
    );
}