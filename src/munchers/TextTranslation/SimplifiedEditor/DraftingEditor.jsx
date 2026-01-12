import { useEffect, useContext, useState } from "react";
import {
  bcvContext as BcvContext,
  debugContext as DebugContext,
  getText
} from "pithekos-lib";
import { Box, Grid2, IconButton, Typography } from "@mui/material";
import NavBar from "./components/NavBar";
import SaveButton from "./components/SaveButton";
import BookPicker from "../../../pages/Workspace/BookPicker";
import PreviewText from "./PreviewText";
import VisibilityIcon from '@mui/icons-material/Visibility';
import usfm2draftJson from '../../../components/usfm2draftJson';
import EditableBible from "./components/EditableBible";
import md5sum from "md5";
import { useNavigate } from "react-router-dom";
import SettingsIcon from '@mui/icons-material/Settings';

function DraftingEditor({
  metadata,
  modified,
  setModified,
  locationState
}) {
  const { systemBcv } = useContext(BcvContext);
  const { debugRef } = useContext(DebugContext);
  const navigate = useNavigate();
  const [openModalPreviewText, setOpenModalPreviewText] = useState(false)
  const [scriptureJson, setScriptureJson] = useState({ headers: {}, blocks: [] });
  const [chapterJson, setChapterJson] = useState(null);
  const [chapterNumbers, setChapterNumbers] = useState([]);
  const [currentBookCode, setCurrentBookCode] = useState("zzz");
  const [currentChapter, setCurrentChapter] = useState("zzz");
  const [md5sumScriptureJson, setMd5sumScriptureJson] = useState([]);
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
        }
      }
      doChapterNumbers().then();
    }

  }, [debugRef, systemBcv.bookCode, metadata, currentBookCode])

  // Get whole book content
  useEffect(() => {
    if (systemBcv.chapterNum !== currentChapter && systemBcv.bookCode !== currentBookCode) {
      const doScriptureJson = async () => {
        let usfmResponse = await getText(`/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.usfm`,
          debugRef.current
        );
        if (usfmResponse.ok) {
          const usfmDraftJson = usfm2draftJson(usfmResponse.text);
          setScriptureJson(
            usfmDraftJson
          )
          const hash = md5sum(JSON.stringify(usfmDraftJson));
          setMd5sumScriptureJson(hash);
        }
      }
      doScriptureJson().then();
    }

  }, [debugRef, systemBcv.bookCode, metadata, systemBcv.chapterNum, currentBookCode, currentChapter]);

  // Make chapter content from whole book content
  useEffect(
    () => {
      if (scriptureJson) {
        setChapterJson(filterByChapter(scriptureJson, systemBcv.chapterNum))
      }
    },
    [scriptureJson, systemBcv.bookCode, systemBcv.chapterNum]
  );

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
          alignItems="center"
          justifyContent="space-between"
          width="100%"
        >
          <Grid2 display="flex" gap={1} >
            <SaveButton
              metadata={metadata}
              systemBcv={systemBcv}
              modified={modified}
              setModified={setModified}
              md5sumScriptureJson={md5sumScriptureJson}
              setMd5sumScriptureJson={setMd5sumScriptureJson}
              scriptureJson={scriptureJson}
            />
            <IconButton onClick={() => {
              handlePreviewText();
            }}>
              <VisibilityIcon />
            </IconButton>
            <PreviewText metadata={metadata} systemBcv={systemBcv} open={openModalPreviewText} setOpenModalPreviewText={setOpenModalPreviewText} />
          </Grid2>

          <Grid2 display="flex" gap={1}>
            <BookPicker/>
            <NavBar
              chapterNumbers={chapterNumbers}
              metadata={metadata}
            />
          </Grid2>
          <Grid2 display="flex" gap={1}>
            <IconButton
              disabled={md5sum(JSON.stringify(scriptureJson)) !== md5sumScriptureJson}
              onClick={() =>
                navigate(
                  {
                    pathname: "/",
                    search: "return-page=workspace"
                  },
                  { state: locationState }
                )
              }
            >
              <SettingsIcon />
            </IconButton>
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
