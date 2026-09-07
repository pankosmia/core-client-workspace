import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import EditableBibleBlock from "./EditableBibleBlock";
import ViewableBibleBlock from "./ViewableBibleBlock";
import EditableGraft from "./EditableGraft";
import EditableRemark from "./EditableRemark";
import ActionsDialog from "./ActionsDialog";
import { useContext, useEffect, useState, useRef } from "react";
import { bcvContext, wordContext } from "pankosmia-rcl";

export default function Bible({
  metadata,
  chapterJson,
  scriptureJson,
  setScriptureJson,
  caretPosition,
  setCaretPosition,
  isEditable,
}) {
  const { systemBcv } = useContext(bcvContext);
  const [selectedBlockNo, setSelectedBlockNo] = useState(null);
  const { word } = useContext(wordContext);
  const lastPrintedVerseRef = useRef(null);

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
      <Dialog open={selectedBlockNo} onClose={() => setSelectedBlockNo(null)}>
        <DialogTitle>
          Edit Paragraph for {systemBcv.bookCode} {systemBcv.chapterNum}
        </DialogTitle>
        <DialogContent>
          <EditableBibleBlock
            key={`${systemBcv.bookCode}-${systemBcv.chapterNum}-${selectedBlockNo}`}
            scriptureJson={scriptureJson}
            setScriptureJson={setScriptureJson}
            position={[selectedBlockNo]}
            caretPosition={caretPosition}
            setCaretPosition={setCaretPosition}
            selectedBlockNo={selectedBlockNo}
            setSelectedBlockNo={setSelectedBlockNo}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedBlockNo(null)}>Close</Button>
          <Button
            onClick={() => setSelectedBlockNo(selectedBlockNo - 1)}
            disabled={selectedBlockNo === 0}
          >
            Previous
          </Button>
          <Button
            onClick={() => setSelectedBlockNo(selectedBlockNo + 1)}
            disabled={
              selectedBlockNo >= scriptureJson.blocks.length - 1 ||
              (selectedBlockNo !== null &&
                scriptureJson.blocks[selectedBlockNo].chapter !==
                  scriptureJson.blocks[selectedBlockNo + 1].chapter)
            }
          >
            Next
          </Button>
        </DialogActions>
      </Dialog>
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
              <ViewableBibleBlock
                key={`${systemBcv.bookCode}-${systemBcv.chapterNum}-${n}`}
                blockJson={scriptureJson.blocks[b.position]}
                systemBcv={systemBcv}
                systemWord={word}
                isCurrentBlock={selectedBlockNo === n}
                setSelectedBlockNo={setSelectedBlockNo}
                lastPrintedVerseRef={lastPrintedVerseRef}
                position={[b.position]}
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
