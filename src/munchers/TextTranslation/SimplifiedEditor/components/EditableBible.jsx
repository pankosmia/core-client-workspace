import EditableBibleBlock from "./EditableBibleBlock";
import EditableGraft from "./EditableGraft";
import EditableRemark from "./EditableRemark";
import { useContext, useEffect, useState, useId } from "react";
import { bcvContext } from "pankosmia-rcl";
import { PanDialogActions } from "pankosmia-rcl";
import {
  Dialog,
  DialogContent,
  Stack,
  Box,
  Button,
  ButtonGroup,
  TextField,
} from "@mui/material";
import { splitPara } from "../Controller";

function ActionsDialog({
  caretPosition,
  setCaretPosition,
  scriptureJson,
  setScriptureJson,
}) {
  const id = useId();
  const [dialog, setDialog] = useState(null);
  const [vNumber, setVNumber] = useState("");

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

  let doAddVerse = () => {
    setCaretPosition(null);
    console.log("AddVerse", vNumber);
  };

  let verseNumberIsValid = () => {
    const verseRegExp = new RegExp(/^[1-9][0-9]{0,2}(-[1-9][0-9]{0,2})?$/);
    return verseRegExp.test(vNumber);
  };

  if (!dialog) {
    return (
      <Dialog open={true} onClose={() => setCaretPosition(null)}>
        <DialogContent>
          <ButtonGroup
            variant="outlined"
            color="secondary"
            orientation="vertical"
          >
            <Button onClick={doSplitPara}>Split Paragraph</Button>
            <Button onClick={() => setDialog("addVerse")}>Add Verse</Button>
          </ButtonGroup>
        </DialogContent>
      </Dialog>
    );
  }

  if (dialog === "addVerse") {
    return (
      <Dialog open={true} onClose={() => setDialog(null)}>
        <DialogContent>
          <Stack sx={{ width: "100%", textAlign: "left" }}>
            <TextField
              error={!verseNumberIsValid()}
              label="Verse Number"
              value={vNumber}
              onChange={(e) =>
                setVNumber(e.target.value.replace(/[^0-9-]/g, ""))
              }
            />
            <Button
              sx={{ textAlign: "left" }}
              variant="outlined"
              disabled={!verseNumberIsValid()}
              onClick={doAddVerse}
            >
              Add Verse
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    );
  }
}

export default function EditableBible({
  chapterJson,
  scriptureJson,
  setScriptureJson,
  caretPosition,
  setCaretPosition,
}) {
  const { systemBcv } = useContext(bcvContext);

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
