import { useRef, useState, useEffect } from "react";
import {useEditable} from "use-editable";

export default function StoryGraft({ block }) {
    const [value, setValue] = useState(block.content[0]);
    const editorRef = useRef(null);
    useEditable(editorRef, setValue);
    return (
        <div style={{ flexDirection: "column" }}>
            <span className="marks_title_label">{block.tag} </span>
            <span  className={block.tag} ref={editorRef}>{value}</span>
        </div>
    );
}