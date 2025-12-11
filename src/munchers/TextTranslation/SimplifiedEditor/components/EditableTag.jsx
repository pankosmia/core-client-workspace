import { useRef, useState, useEffect } from "react";
import {useEditable} from "use-editable";

export default function EditableTag({ block, position, filterScriptureJsonChapter}) {
    const [value, setValue] = useState(block.tag);
    const editorRef = useRef(null);
    useEditable(editorRef, setValue);
    return <span ref={editorRef} className={block.tag}>{value}</span>
}