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
        <div style={{ flexDirection: "column" }}>
            <span className="marks_title_label">{block.tag} </span>
            <span  className={block.tag} contentEditable ref={span} onInput={onUpdate}> {value}</span>
        </div>
    );
}