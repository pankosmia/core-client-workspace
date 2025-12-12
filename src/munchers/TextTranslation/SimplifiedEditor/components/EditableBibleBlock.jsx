import EditableSpan from "./EditableSpan";
import EditableTag from "./EditableTag";

export default function EditableBibleBlock({scriptureJson, setScriptureJson, position}) {
    if (scriptureJson.blocks[position[0]]) {
        return (
            <div style={{flexDirection: "column", textAlign: "left"}} className={scriptureJson.blocks[position[0]].tag}>
                <EditableTag scriptureJson={scriptureJson} setScriptureJson={setScriptureJson}
                             position={position}/>
                {scriptureJson.blocks[position[0]].units && scriptureJson.blocks[position[0]].units.map((u, i) => (
                    <span>
                        <span key={i} className="marks_verses_label">{u.verses}</span>
                        <EditableSpan key={i} scriptureJson={scriptureJson} setScriptureJson={setScriptureJson}
                                      position={[...position, i]}/>
                    </span>
                ))}
            </div>
        );
    } else {
        return "";
    }
}