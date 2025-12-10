import { useRef, useState, useEffect } from "react";
import {useEditable} from "use-editable";

export default function EditableSpan({ block, unit, position }) {
    const [value, setValue] = useState(unit.content[0]);
    const editorRef = useRef(null);
    useEditable(editorRef, setValue);
    return <span ref={editorRef} className={block.tag}>{value}</span>
}