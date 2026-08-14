import { useContext, useRef, useState } from "react";
import { useEditable } from "use-editable";
import { updateUnitContent } from "../Controller";
import { postEmptyJson, postJson } from "pankosmia-lib/http";

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
  endVerse,
  caretPosition,
  setCaretPosition,
}) {
  const incomingBlock = scriptureJson.blocks[position[0]];
  const incomingContent =
    incomingBlock.units && incomingBlock.units[position[1]].content
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

  const updateBcv = (b, c, v, ev) => {
    postEmptyJson(
      `/api/navigation/bcv/${b}/${c}/${v}/${ev ? ev : v}`,
      debugRef.current,
    );
  };

  if (incomingContent === null) {
    return "";
  }

  if (firstTime) {
    setValue(incomingContent);
    setFirstTime(false);
  }

  const getCaretPosition = (e) => {
    let caretPosition = null;
    if (editorRef.current) {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      if (!range.collapsed) {
        return null;
      }
      const range2 = range.cloneRange();
      const temp = document.createTextNode("\0");
      range.insertNode(temp);
      caretPosition = editorRef.current.innerText.indexOf("\0");
      temp.parentNode.removeChild(temp);
    }
    return caretPosition;
  };

  const getWordAtCursor = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return null;
    const range = selection.getRangeAt(0);
    const text = range.startContainer.textContent;
    let offset = range.startOffset;

    if (offset >= text.length || !/\p{L}/u.test(text[offset])) {
      let distPrev = Infinity,
        posPrev = -1;
      let spaces = 0;
      for (let i = offset - 1; i >= 0; i--) {
        if (/\p{L}/u.test(text[i])) {
          distPrev = spaces;
          posPrev = i;
          break;
        }
        if (/\s/.test(text[i])) spaces++;
      }

      let distNext = Infinity,
        posNext = -1;
      spaces = 0;
      for (let i = offset; i < text.length; i++) {
        if (/\p{L}/u.test(text[i])) {
          distNext = spaces;
          posNext = i;
          break;
        }
        if (/\s/.test(text[i])) spaces++;
      }

      if (posPrev === -1 && posNext === -1) return null;
      offset = distNext < distPrev ? posNext : posPrev;
    }

    let start = offset;
    while (start > 0 && /\p{L}/u.test(text[start - 1])) {
      start--;
    }

    let end = offset;
    while (end < text.length && /\p{L}/u.test(text[end])) {
      end++;
    }
    return text.slice(start, end);
  };

  return (
    <div
      onContextMenu={(e) =>
        setCaretPosition({
          cp: getCaretPosition(e),
          position,
          mouseX: e.mouseX,
          mouseY: e.mouseY,
        })
      }
      onClick={(e) => {
        const word = getWordAtCursor();
        if (word) {
          postJson(
            "/api/app-state/word",
            JSON.stringify({ target: word }),
            debugRef.current,
          );
        }
      }}
    >
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
          updateBcv(systemBcv.bookCode, chapter, verse, endVerse);
          return false;
        }}
      >
        {value}
      </span>
    </div>
  );
}
