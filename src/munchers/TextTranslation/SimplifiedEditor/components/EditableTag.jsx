import { useRef, useState } from "react";
import editBlockTag from "../Controller";

export default function EditableTag({ block, position, filterScriptureJsonChapter }) {
    const [value, setValue] = useState(block.tag);
    const span = useRef(null);
    span.current =  {value} ;

    const onUpdate = e => {
        e.stopPropagation();
        setValue(span.current.value);
    };
    return <span contentEditable ref={span} onInput={onUpdate} onBlur={() => { editBlockTag(filterScriptureJsonChapter, position, value) }} className={block.tag}>{value}</span>
}