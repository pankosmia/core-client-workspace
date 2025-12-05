import EditableSpan from "./EditableSpan";
import EditableTag from "./EditableTag";

export default function StoryBibleBlock({ block, position,filterScriptureJsonChapter }) {
    return (
        <div style={{ flexDirection: "column",textAlign:"left" }}>
            <EditableTag filterScriptureJsonChapter={filterScriptureJsonChapter} block={block} position={[...position]}/>
            {/* <span className="marks_title_label">{block.tag} </span> */}
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