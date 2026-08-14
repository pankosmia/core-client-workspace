import EditableBibleBlock from "./EditableBibleBlock";
import EditableGraft from "./EditableGraft";
import EditableRemark from "./EditableRemark";
import { useContext, useEffect, useState, useId } from "react";
import { bcvContext } from "pankosmia-rcl";
import { PanDialogActions } from "pankosmia-rcl";
import {
  Stack,
  Box,
  Button,
  ButtonGroup,
  TextField,
  IconButton,
} from "@mui/material";
import { splitPara } from "../Controller";
import { productContext as ProductContext } from "pankosmia-rcl";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

function ActionsDialog({
  caretPosition,
  setCaretPosition,
  scriptureJson,
  setScriptureJson,
}) {
  const id = useId();
  const [vNumber, setVNumber] = useState("");
  const { product } = useContext(ProductContext);

  let doSplitPara = () => {
    const unit = scriptureJson.blocks[caretPosition.position[0]]?.units;
    if (unit) {
      let content = unit[caretPosition.position[1]]?.content;
      if (content && content[0]) {
        setCaretPosition(null);
        setTimeout(() => {
          setScriptureJson(splitPara(scriptureJson, caretPosition));
        }, 100);
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

  if (caretPosition) {
    return (
      <>
        <Box
          sx={{
            zIndex: 1800,
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#000",
            opacity: "30%",
          }}
          onClick={() => setCaretPosition(null)}
        ></Box>
        <Box
          sx={{
            zIndex: 2000,
            position: "absolute",
            top: product && product.os === "android" ? "90px" : "60px",
            right: product && product.os === "android" ? "90px" : "60px",
            backgroundColor: "#FFF",
          }}
        >
          <Stack sx={{ width: "100%" }}>
            <Stack direction="row" justifyContent="end" sx={{ width: "100%" }}>
              <IconButton size="small" onClick={() => setCaretPosition(null)}>
                <CloseOutlinedIcon />
              </IconButton>
            </Stack>
            <Stack sx={{ width: "100%", p: 1 }} spacing={2}>
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => {
                  doSplitPara();
                  e.stopPropagation();
                }}
              >
                Split Paragraph
              </Button>
              <Stack
                sx={{ width: "100%", border: "1px #CCC solid", p: 1 }}
                spacing={1}
              >
                <TextField
                  value={vNumber}
                  size="small"
                  label="Verse N°"
                  onChange={(e) => {
                    setVNumber(e.target.value.replace(/[^0-9-]/g, ""));
                    e.stopPropagation();
                  }}
                />
                <Button
                  sx={{ textAlign: "left" }}
                  size="small"
                  disabled={!verseNumberIsValid()}
                  variant="outlined"
                  onClick={(e) => {
                    console.log("Adding");
                    doAddVerse();
                    e.stopPropagation();
                  }}
                >
                  Add Verse
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </>
    );
  }
  return "";
}

export default function EditableBible({
  chapterJson,
  scriptureJson,
  setScriptureJson,
  caretPosition,
  setCaretPosition,
}) {
  console.log("Bible");
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
