import { useEffect } from "react";
import EditableSpan from "./EditableSpan";
import EditableTag from "./EditableTag";

export default function EditableBibleBlock({
  scriptureJson,
  setScriptureJson,
  position,
  caretPosition,
  setCaretPosition,
  selectedBlockNo,
  setSelectedBlockNo,
}) {
  if (scriptureJson.blocks[position[0]]) {
    const tag = scriptureJson.blocks[position[0]].tag;
    return (
      <div
        key={position}
        style={{ flexDirection: "column", textAlign: "left" }}
        className={tag}
        onClick={() => setSelectedBlockNo(position[0])}
      >
        <EditableTag
          scriptureJson={scriptureJson}
          setScriptureJson={setScriptureJson}
          position={position}
        />
        {!["b", "ib"].includes(tag) &&
          scriptureJson.blocks[position[0]].units &&
          (selectedBlockNo === position[0] ? (
            <div>Editing</div>
          ) : (
            scriptureJson.blocks[position[0]].units.map((u, i) => {
              return (
                <span style={{ display: "inline-block" }}>
                  <span key={i} className="marks_verses_label">
                    {u.verses}
                  </span>
                  <EditableSpan
                    key={i}
                    caretPosition={caretPosition}
                    setCaretPosition={setCaretPosition}
                    scriptureJson={scriptureJson}
                    setScriptureJson={setScriptureJson}
                    position={[...position, i]}
                    chapter={u.chapter}
                    verse={
                      u.verses.includes("-") ? u.verses.split("-")[0] : u.verses
                    }
                    endVerse={
                      u.verses.includes("-") ? u.verses.split("-")[1] : u.verses
                    }
                  />
                </span>
              );
            })
          ))}
      </div>
    );
  } else {
    return "";
  }
}
