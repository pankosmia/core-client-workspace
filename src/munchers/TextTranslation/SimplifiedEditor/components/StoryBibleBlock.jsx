import EditableSpan from "./EditableSpan";

export default function StoryBibleBlock({ type }) {
    return (
        <div style={{ flexDirection: "column" }} className={type.tag}>
            <span>{type.tag} </span>
            <span>
                {type.units.map((u, i) => (
                    <span>
                        <span className="marks_verses_label">{u.verses}</span>
                        <EditableSpan type={type} unit={u}/>
                    </span>
                ))}
            </span>


        </div>
    );
}