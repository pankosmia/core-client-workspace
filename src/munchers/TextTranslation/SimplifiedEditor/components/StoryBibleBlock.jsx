import EditableSpan from "./EditableSpan";

export default function StoryBibleBlock({ block, position }) {
    return (
        <div style={{ flexDirection: "column",textAlign:"left" }}>
            <span className="marks_title_label">{block.tag} </span>
            <span className={block.tag} >
                {block.units.map((u, i) => (
                    <span>
                        <span className="marks_verses_label">{u.verses}</span>
                        <EditableSpan block={block} unit={u} position={[...position,"units",i]}/>
                    </span>
                ))}
            </span>

        </div>
    );
}