import EditableBibleBlock from "./EditableBibleBlock";
import EditableGraft from "./EditableGraft";
import EditableRemark from "./EditableRemark";
import { useContext, useEffect, useState } from "react";
import { bcvContext } from "pankosmia-rcl";
import ContextMenu from "./ContextMenu";

export default function EditableBible({
  chapterJson,
  scriptureJson,
  setScriptureJson,
}) {
  console.log("bible");
  const { systemBcv } = useContext(bcvContext);
  const [contextMenu, setContextMenu] = useState(null);

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

  const handleContextMenu = (e) => {
    console.log("context");
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    setContextMenu(
      contextMenu === null
        ? {
            mouseX: e.clientX + 2,
            mouseY: e.clientY - 6,
          }
        : null,
    );

    const selection = document.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
    }
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  return (
    <>
      <div onContextMenu={handleContextMenu}>
        {!contextMenu ? (
          chapterJson.blocks.map((b, n) => {
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
                    contextMenu={contextMenu}
                    setContextMenu={setContextMenu}
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
          })
        ) : (
          <ContextMenu
            contextMenuValue={contextMenu}
            handleClose={handleClose}
          />
        )}
      </div>
    </>
  );
}
