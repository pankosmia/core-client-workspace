import { useContext, useRef, useState } from "react";
import { useEditable } from "use-editable";
import { updateUnitContent } from "../Controller";
import { postEmptyJson } from "pithekos-lib";

import {
  bcvContext as BcvContext,
  debugContext as DebugContext,
} from "pankosmia-rcl";

export default function EditableSpan({
  key,
  scriptureJson,
  setScriptureJson,
  position,
  chapter,
  verse,
}) {
  const incomingBlock = scriptureJson.blocks[position[0]];
  const incomingContent = incomingBlock.units[position[1]].content
    ? incomingBlock.units[position[1]].content[0]
    : null;
  const [firstTime, setFirstTime] = useState(true);
  const [value, setValue] = useState(incomingContent || "");
  const { debugRef } = useContext(DebugContext);
  const { systemBcv } = useContext(BcvContext);
  const editorRef = useRef(null);
  useEditable(editorRef, setValue);

  const updateScriptureJson = async (scriptureJson, position, value) =>
    setTimeout(() => {
      setScriptureJson(updateUnitContent(scriptureJson, position, value));
    }, 100);

  const updateBcv = (b, c, v) => {
    postEmptyJson(`/navigation/bcv/${b}/${c}/${v}`, debugRef.current);
  };

  if (incomingContent === null) {
    return "";
  }

  if (firstTime && incomingContent !== null) {
    setValue(incomingContent);
    setFirstTime(false);
  }
  return (
    <span
      key={`${key}-editable`}
      ref={editorRef}
      className="span_edit_verses"
      contentEditable="plaintext-only"
      style={{
        paddingRight: value.trim() === "" ? "20px" : "0",
        backgroundColor: value.trim() === "" ? "#CCC" : "#FFF",
      }}
      onBlur={(e) => {
        // console.log("BLUR", position)
        updateScriptureJson(scriptureJson, position, value).then();
        return false;
      }}
      onFocus={(e) => {
        //console.log("FOCUS", position)
        updateBcv(systemBcv.bookCode, chapter, verse);
        return false;
      }}
    >
      {value}
    </span>
  );
}
