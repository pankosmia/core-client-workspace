import { useEffect } from "react";
import EditableSpan from "./EditableSpan";
import EditableTag from "./EditableTag";
import { splitPara } from "../Controller";

export default function EditableBibleBlock({
  scriptureJson,
  setScriptureJson,
  position,
  caretPosition,
  setCaretPosition,
}) {
  useEffect(() => {
    if (caretPosition && caretPosition.position[0] === position[0]) {
      console.log("This block");
      const unit = scriptureJson.blocks[caretPosition.position[0]]?.units;
      if (unit) {
        let content = unit[caretPosition.position[1]]?.content;
        if (content && content[0]) {
          let beforeContent = content[0].slice(0, caretPosition.cp);
          let afterContent = content[0].slice(caretPosition.cp);
          // console.log("content", `'${beforeContent}' // '${afterContent}'`);
          setScriptureJson(splitPara(scriptureJson, caretPosition));
        }
      }
      setCaretPosition(null);
    }
  }, [caretPosition]);

  if (scriptureJson.blocks[position[0]]) {
    const tag = scriptureJson.blocks[position[0]].tag;
    return (
      <div
        key={position}
        style={{ flexDirection: "column", textAlign: "left" }}
        className={tag}
      >
        <EditableTag
          scriptureJson={scriptureJson}
          setScriptureJson={setScriptureJson}
          position={position}
        />
        {!["b", "ib"].includes(tag) &&
          scriptureJson.blocks[position[0]].units &&
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
          })}
      </div>
    );
  } else {
    return "";
  }
}
