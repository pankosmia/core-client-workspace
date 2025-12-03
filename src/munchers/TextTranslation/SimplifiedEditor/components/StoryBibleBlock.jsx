import EditableSpan from "./EditableSpan";

export default function StoryBibleBlock({ block }) {
    return (
        <div style={{ flexDirection: "column" }}>
            <span>{block.tag} </span>
            <span className={block.tag}>
                {block.units.map((u, i) => (
                    <span>
                        <span className="marks_verses_label">{u.verses}</span>
                        <EditableSpan block={block} unit={u}/>
                    </span>
                ))}
            </span>


        </div>
    );
}