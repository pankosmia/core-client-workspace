import { useRef, useState } from "react";

export default function EditableSpan({type, unit }) {
    const [value, setValue] = useState(unit.content[0]);
    const span = useRef(null);
    span.current = {value};

    const onUpdate = e => {
        e.stopPropagation();
        setValue(span.current.value);
    };

    return <span contentEditable ref={span} onInput={onUpdate} className={type.tag}>{value}</span>
       

}