import EditableSpan from "./EditableSpan";
import EditableTag from "./EditableTag";

export default function EditableBibleBlock({scriptureJson, setScriptureJson, position}) {
    // console.log(scriptureJson.blocks[position[0]]);
    return (
        <div style={{ flexDirection: "column",textAlign:"left" }} className={scriptureJson.blocks[position[0]].tag}>
            {/* <EditableTag filterScriptureJsonChapter={filterScriptureJsonChapter} block={block} position={[...position]}/> */}
            <span className={scriptureJson.blocks[position[0]].tag} >
                {scriptureJson.blocks[position[0]].units.map((u, i) => (
                    <span>
                        <span className="marks_verses_label">{u.verses}</span>
                        <EditableSpan scriptureJson={scriptureJson} setScriptureJson={setScriptureJson} position={[...position, i]}/>
                    </span>
                ))}
            </span>

        </div>
    );
}