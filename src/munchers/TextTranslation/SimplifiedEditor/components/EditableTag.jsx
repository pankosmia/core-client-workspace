import { useRef, useState, useEffect } from "react";
import {useEditable} from "use-editable";
import editBlockTag from "../Controller";

export default function EditableTag({ block, position, filterScriptureJsonChapter}) {
    const [value, setValue] = useState(block.tag);
    const editorRef = useRef(null);
    useEditable(editorRef, setValue);
    return <span ref={editorRef} onBlur={() => { editBlockTag(filterScriptureJsonChapter, position, value) }} className={block.tag}>{value}</span>
}