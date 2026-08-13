import EditableBibleBlock from "./EditableBibleBlock";
import EditableGraft from "./EditableGraft";
import EditableRemark from "./EditableRemark";
import { useContext, useEffect, useState, useId } from "react";
import { bcvContext } from "pankosmia-rcl";
import { PanDialog, PanDialogActions } from "pankosmia-rcl";
import { DialogContent, Stack, Box, Button, TextField } from "@mui/material";
import { splitPara } from "../Controller";

function ActionsDialog({
  caretPosition,
  setCaretPosition,
  scriptureJson,
  setScriptureJson,
}) {
  const id = useId();
  const [verseNo, setVerseNo] = useState(null);

  let doSplitPara = () => {
    const unit = scriptureJson.blocks[caretPosition.position[0]]?.units;
    if (unit) {
      let content = unit[caretPosition.position[1]]?.content;
      if (content && content[0]) {
        setCaretPosition(null);
        setScriptureJson(splitPara(scriptureJson, caretPosition));
      }
    }
  };

  return (
    <PanDialog
      titleLabel="Actions"
      isOpen={true}
      closeFn={() => setCaretPosition(null)}
    >
      <DialogContent>
        <Stack sx={{ width: "100%", textAlign: "left" }}>
          <Button variant="outlined" onClick={doSplitPara}>
            Split Para
          </Button>
          <Box>
            <Button
              sx={{ textAlign: "left" }}
              variant="outlined"
              onClick={() => false}
              disabled={!verseNo}
            >
              Add Verse
            </Button>
            <TextField
              id="verse number"
              label="Verse N°"
              onChange={(e) =>
                setVerseNo(e.target.value.replace(/[^0-9\-]/g, ""))
              }
              value={verseNo}
            />
          </Box>
        </Stack>
      </DialogContent>
    </PanDialog>
  );
}

export default function EditableBible({
  chapterJson,
  scriptureJson,
  setScriptureJson,
}) {
  console.log("bible");
  const { systemBcv } = useContext(bcvContext);
  const [caretPosition, setCaretPosition] = useState(null);

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

  if (caretPosition) {
    return (
      <ActionsDialog
        caretPosition={caretPosition}
        setCaretPosition={setCaretPosition}
        scriptureJson={scriptureJson}
        setScriptureJson={setScriptureJson}
      />
    );
  }

  return (
    <div>
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
