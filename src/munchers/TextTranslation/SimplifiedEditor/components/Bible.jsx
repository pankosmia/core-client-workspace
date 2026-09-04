import EditableBibleBlock from "./EditableBibleBlock";
import EditableGraft from "./EditableGraft";
import EditableRemark from "./EditableRemark";
import ActionsDialog from "./ActionsDialog";
import { useContext, useEffect, useState } from "react";
import { bcvContext } from "pankosmia-rcl";

export default function EditableBible({
  chapterJson,
  scriptureJson,
  setScriptureJson,
  caretPosition,
  setCaretPosition,
  isEditable,
}) {
  console.log("Bible");
  const { systemBcv } = useContext(bcvContext);
  const [selectedBlockNo, setSelectedBlockNo] = useState(5);

  useEffect(() => {
    async function loadCSS() {
      const url = "/api/app-resources/usfm/bible_page_styles.css";
      const response = await fetch(url);
      if (!response.ok) {
        console.error("Erreur de chargement du CSS :", response.status);
        return;
      }
      const cssText = await response.text();
      const style = document.createElement("style");
      style.textContent = cssText;
      document.head.appendChild(style);
    }
    loadCSS();
  }, []);

  return (
    <div>
      {caretPosition && (
        <ActionsDialog
          caretPosition={caretPosition}
          setCaretPosition={setCaretPosition}
          scriptureJson={scriptureJson}
          setScriptureJson={setScriptureJson}
        />
      )}
      {chapterJson.blocks.map((b, n) => {
        switch (b.type) {
          case "chapter":
            return "";

          case "remark":
            return (
              <EditableRemark
                key={`${systemBcv.bookCode}-${systemBcv.chapterNum}-${n}`}
                scriptureJson={scriptureJson}
                setScriptureJson={setScriptureJson}
                position={[b.position]}
              />
            );

          case "main":
            return (
              <EditableBibleBlock
                key={`${systemBcv.bookCode}-${systemBcv.chapterNum}-${n}`}
                scriptureJson={scriptureJson}
                setScriptureJson={setScriptureJson}
                position={[b.position]}
                caretPosition={caretPosition}
                setCaretPosition={setCaretPosition}
                selectedBlockNo={selectedBlockNo}
                setSelectedBlockNo={setSelectedBlockNo}
              />
            );

          default:
            return (
              <EditableGraft
                key={`${systemBcv.bookCode}-${systemBcv.chapterNum}-${n}`}
                scriptureJson={scriptureJson}
                setScriptureJson={setScriptureJson}
                position={[b.position]}
              />
            );
        }
      })}
    </div>
  );
}
