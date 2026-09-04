import { useEffect, useContext, useState } from "react";
import { getText } from "pankosmia-lib/http";
import {
  bcvContext as BcvContext,
  debugContext as DebugContext,
} from "pankosmia-rcl";
import { Box, CircularProgress } from "@mui/material";
import usfm2draftJson from "../../../components/usfm2draftJson";
import Bible from "./components/Bible";
import md5sum from "md5";
import EditorTools from "./components/EditorTools";
import filterByChapter from "../../../components/filterByChapter";
import TextDir from "../../helpers/TextDir";
import ExtractJsonValues from "../../helpers/ExtractJsonValues";

function DraftingEditor({ metadata, modified, setModified }) {
  const { systemBcv } = useContext(BcvContext);
  const { debugRef } = useContext(DebugContext);
  const [scriptureJson, setScriptureJson] = useState({
    headers: {},
    blocks: [],
  });
  const [chapterJson, setChapterJson] = useState(null);
  const [md5sumScriptureJson, setMd5sumScriptureJson] = useState([]);
  const [currentBookCode, setCurrentBookCode] = useState("zzz");
  const [bookChangeCount, setBookChangeCount] = useState(0);
  const [textDir, setTextDir] = useState(
    metadata?.script_direction
      ? metadata.script_direction.toLowerCase()
      : undefined,
  );
  const [caretPosition, setCaretPosition] = useState(null);

  const sbScriptDir = metadata?.script_direction
    ? metadata.script_direction.toLowerCase()
    : undefined;
  const sbScriptDirSet = sbScriptDir === "ltr" || sbScriptDir === "rtl";

  // Set up 'are you sure you want to leave page' for Electron
  useEffect(() => {
    const isElectron = !!window.electronAPI;
    if (isElectron) {
      window.electronAPI.setCanClose(!modified);
    }
  }, [modified]);

  // Get whole book content
  useEffect(() => {
    if (systemBcv.bookCode !== currentBookCode) {
      const doScriptureJson = async () => {
        setChapterJson(null);
        let usfmResponse = await getText(
          `/api/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.usfm`,
          debugRef.current,
        );
        if (usfmResponse.ok) {
          const usfmDraftJson = await usfm2draftJson(usfmResponse.text);
          setScriptureJson(usfmDraftJson);
          const hash = md5sum(JSON.stringify(usfmDraftJson));
          setMd5sumScriptureJson(hash);
          if (!sbScriptDirSet) {
            const dir = await TextDir(usfmResponse.text, "usfm");
            setTextDir(dir);
          }
        }
      };
      doScriptureJson().then();
    }
  }, [debugRef, systemBcv.bookCode, metadata, currentBookCode, sbScriptDirSet]);

  useEffect(() => {
    if (scriptureJson && scriptureJson.blocks.length > 0) {
      setChapterJson(filterByChapter(scriptureJson, systemBcv.chapterNum));
      setBookChangeCount(bookChangeCount + 1);
    }
  }, [scriptureJson, systemBcv.chapterNum]);

  useEffect(() => {
    if (!sbScriptDirSet) {
      const contentText = ExtractJsonValues(scriptureJson, ["content"])
        .toString()
        .replace(/,/g, "");
      const dir = TextDir(contentText, "text");
      if (textDir !== dir) {
        setTextDir(dir);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptureJson, sbScriptDirSet]);

  return (
    <>
      <EditorTools
        metadata={metadata}
        modified={modified}
        setModified={setModified}
        md5sumScriptureJson={md5sumScriptureJson}
        setMd5sumScriptureJson={setMd5sumScriptureJson}
        scriptureJson={scriptureJson}
        currentBookCode={currentBookCode}
        setCurrentBookCode={setCurrentBookCode}
        caretPosition={caretPosition}
        setCaretPosition={setCaretPosition}
      />
      {/** If SB does not specify direction then it is set here, otherwise it has already been set per SB in WorkspaceCard */}
      <Box dir={!sbScriptDirSet ? textDir : undefined}>
        {chapterJson ? (
          <Bible
            chapterJson={chapterJson}
            scriptureJson={scriptureJson}
            setScriptureJson={setScriptureJson}
            key={bookChangeCount}
            caretPosition={caretPosition}
            setCaretPosition={setCaretPosition}
            isEditable={true}
          />
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              minHeight: "150px",
            }}
          >
            <CircularProgress size={40} />
          </Box>
        )}
      </Box>
    </>
  );
}

export default DraftingEditor;
