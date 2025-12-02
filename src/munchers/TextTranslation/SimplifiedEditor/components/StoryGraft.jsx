import { useRef, useState } from "react";

export default function StoryGraft({ type }) {
    const [value, setValue] = useState(type.content[0]);
    const span = useRef(null);
    span.current = {value};

    const onUpdate = e => {
        e.stopPropagation();
        setValue(span.current.value);
    };

    return (
        <div style={{ flexDirection: "column" }} className={type.tag}>
            <span>{type.tag} </span>
            <span contentEditable ref={span} onInput={onUpdate}> {value}</span>
        </div>
    );
}