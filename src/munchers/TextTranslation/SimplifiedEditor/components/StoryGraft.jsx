import { useRef, useState } from "react";

export default function StoryGraft({ block }) {
    const [value, setValue] = useState(block.content[0]);
    const span = useRef(null);
    span.current = {value};

    const onUpdate = e => {
        e.stopPropagation();
        setValue(span.current.value);
    };

    return (
        <div style={{ flexDirection: "column" }} className={block.tag}>
            <span>{block.tag} </span>
            <span contentEditable ref={span} onInput={onUpdate}> {value}</span>
        </div>
    );
}