import { useEffect, useContext, useState } from "react";
import {
  bcvContext as BcvContext,
  debugContext as DebugContext,
  getText,
  postEmptyJson,
} from "pithekos-lib";
import { Box, Grid2, IconButton, Typography } from "@mui/material";
import NavBar from "./components/NavBar";
import SaveButton from "./components/SaveButton";
import ChangeEditor from "../ChangeEditor";
import BcvPicker from "../../../pages/Workspace/BcvPicker";
import PreviewText from "./PreviewText";
import VisibilityIcon from '@mui/icons-material/Visibility';
import usfm2draftJson from '../../../components/usfm2draftJson';
import draftJson2usfm from '../../../components/draftJson2usfm';
import EditableBible from "./components/EditableBible";
import md5sum from "md5";
// import editBlockTag from "./Controller";

function DraftingEditor({
  metadata,
  modified,
  setModified,
  editorMode,
  setEditor,
}) {
  const { systemBcv } = useContext(BcvContext);
  const { debugRef } = useContext(DebugContext);
  const [usfmHeader, setUsfmHeader] = useState("");
  const [savedChecksum, setSavedChecksum] = useState(null);
  const [openModalPreviewText, setOpenModalPreviewText] = useState(false)
  const [scriptureJson, setScriptureJson] = useState({ headers: {}, blocks: [] });
  const [chapterJson, setChapterJson] = useState(null);
  const [chapterNumbers, setChapterNumbers] = useState([]);
  const [currentBookCode, setCurrentBookCode] = useState("zzz");

  const handlePreviewText = () => {
    setOpenModalPreviewText(true)
  }

  // Set up 'are you sure you want to leave page' for Electron
  useEffect(() => {
    const isElectron = !!window.electronAPI;
    if (isElectron) {
      window.electronAPI.setCanClose(!modified);
    }
  }, [modified]);

  const filterByChapter = (usfmJson, requiredChapter) => {
    let chapterBlocks = [];
    let currentChapter = 0;
    let blockN = 0;
    for (const block of usfmJson.blocks) {
      if (block.type === "chapter") {
        currentChapter = block.chapter
      }
      if (currentChapter === requiredChapter) {
        chapterBlocks.push({ ...block, position: blockN })
      }
      blockN += 1
    }
    return {
      headers: usfmJson.headers,
      blocks: chapterBlocks
    }
  }

  // Set up chapter numbers when changing book

  const allChapterNumbers = (usfmJson) => {
    let chapters = []
    for (const block of usfmJson.blocks) {
      if (block.type === "chapter") {
        chapters.push(block.chapter)
      }
    }
    return chapters
  }

  useEffect(() => {
    if (systemBcv.bookCode !== currentBookCode) {
      const doChapterNumbers = async () => {
        let usfmResponse = await getText(`/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.usfm`,
          debugRef.current
        );
        if (usfmResponse.ok) {
          const usfmDraftJson = usfm2draftJson(usfmResponse.text)
          const newChapterNumbers = allChapterNumbers(usfmDraftJson)
          setCurrentBookCode(systemBcv.bookCode)
          setChapterNumbers(newChapterNumbers)
          postEmptyJson(
            `/navigation/bcv/${systemBcv.bookCode}/${newChapterNumbers[0]}/1`,
            debugRef.current);
        }
      }
      doChapterNumbers().then();
    }

  }, [debugRef, systemBcv.bookCode, metadata, currentBookCode])

  // Get whole book content
  useEffect(() => {
    const doScriptureJson = async () => {
      let usfmResponse = await getText(`/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.usfm`,
        debugRef.current
      );
      if (usfmResponse.ok) {
        const usfmDraftJson = usfm2draftJson(usfmResponse.text);
        console.log(usfmDraftJson);
        setScriptureJson(
          usfmDraftJson
        )
      }
    }
    doScriptureJson().then();
  }, [debugRef, systemBcv.bookCode, metadata, systemBcv.chapterNum]);

  // Make chapter content from whole book content
  useEffect(
    () => {
      if (scriptureJson) {
        setChapterJson(filterByChapter(scriptureJson, systemBcv.chapterNum))
      }
    },
    [scriptureJson, systemBcv.bookCode, systemBcv.chapterNum]
  );
  console.log("scriptureJson",scriptureJson);
  console.log("usfm", draftJson2usfm(scriptureJson));
  return (
    <>
      <Box
        sx={{
          position: "fixed",
          top: "40px",
          left: 0,
          right: 0,
          display: "flex",
          padding: 2,
        }}
      >
        <Grid2
          container
          spacing={1}
          justifyContent="space-around"
          alignItems="stretch"
          width="100%"
        >
          <Grid2 item size={2}>
            <SaveButton
              metadata={metadata}
              systemBcv={systemBcv}
              usfmHeader={usfmHeader}
              modified={modified}
              setModified={setModified}
              setSavedChecksum={setSavedChecksum}
            />
          </Grid2>
          <Grid2 item size={2}>
            <IconButton onClick={() => {
              handlePreviewText();
            }}>
              <VisibilityIcon />
            </IconButton>
            <PreviewText metadata={metadata} systemBcv={systemBcv} open={openModalPreviewText === true} closeModal={() => setOpenModalPreviewText(false)} />
          </Grid2>
          <Grid2 item size={2}>
            <BcvPicker />
          </Grid2>
          <Grid2 item size={4}>
            <NavBar
              chapterNumbers={chapterNumbers}
              metadata={metadata}
              systemBcv={systemBcv}
            />
          </Grid2>
          <Grid2 item size={2}>
            <ChangeEditor
              editor={editorMode}
              setEditor={setEditor}
              modified={modified}
              setModified={setModified}
            />
          </Grid2>
        </Grid2>
      </Box>
      <Box>
        {chapterJson ? (
          <EditableBible key={md5sum(JSON.stringify(chapterJson))} chapterJson={chapterJson} scriptureJson={scriptureJson} setScriptureJson={setScriptureJson} />
        ) : (<Typography> loading ...</Typography>)}
      </Box>
    </>
  );
}

export default DraftingEditor;
