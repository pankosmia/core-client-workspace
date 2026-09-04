import { useContext, useState, useId } from "react";
import {
  Stack,
  Box,
  Button,
  TextField,
  IconButton,
} from "@mui/material";
import { splitPara } from "../Controller";
import { productContext as ProductContext } from "pankosmia-rcl";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

export default function ActionsDialog({
  caretPosition,
  setCaretPosition,
  scriptureJson,
  setScriptureJson,
}) {
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
              <IconButton
                size="small"
                onClick={() => setCaretPosition(null)}
                sx={{ pr: 2 }}
              >
                <CloseOutlinedIcon sx={{ p: 0 }} />
              </IconButton>
            </Stack>
            <Stack
              sx={{ width: "100%", pt: 0, pb: 1, pl: 1, pr: 1 }}
              spacing={2}
            >
              <Box sx={{ pl: 1, pr: 1, pt: 0, pb: 1 }}>
                <Stack sx={{ border: "1px #777 solid", p: 1 }} spacing={1}>
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
              </Box>
              <Stack sx={{ width: "100%", p: 1 }} spacing={1}>
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
                <Button
                  size="small"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  Merge Paragraph Up
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  Merge Paragraph Down
                </Button>
              </Stack>
              <Stack sx={{ width: "100%", p: 1 }} spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  Add Footnote
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  Add Cross-Reference
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