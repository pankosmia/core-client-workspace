import { useRef, useState } from "react";

export default function EditableSpan({block, unit }) {
    const [value, setValue] = useState(unit.content[0]);
    const span = useRef(null);
    span.current = {value};

    const onUpdate = e => {
        e.stopPropagation();
        setValue(span.current.value);
    };

    return <span contentEditable ref={span} onInput={onUpdate} className={block.tag}>{value}</span>
       

}