import { useEffect, useContext, useState } from "react";
import md5 from "md5";
import { Proskomma } from "proskomma-core";
import {
  bcvContext as BcvContext,
  debugContext as DebugContext,
  getJson,
  getText,
  postEmptyJson,
} from "pithekos-lib";
import { Box, Grid2, IconButton, Typography } from "@mui/material";
import RequireResources from "../../../components/RequireResources";
import juxta2Units from "../../../components/juxta2Units";
import NavBarDrafting from "./components/NavBarDrafting";
import SaveButtonDrafting from "./components/SaveButtonDrafting";
import CustomEditorMode from "../CustomEditorMode";
import BcvPicker from "../../../pages/Workspace/BcvPicker";
import PreviewText from "./PreviewText";
import VisibilityIcon from '@mui/icons-material/Visibility';
import usfm2draftJson from '../../../components/usfm2draftJson';
import ScriptureBible from "./components/ScriptureBible";

function DraftingEditor({
  metadata,
  modified,
  setModified,
  editorMode,
  setEditor,
}) {
  const { systemBcv } = useContext(BcvContext);
  const { debugRef } = useContext(DebugContext);
  const [units, setUnits] = useState([]);
  const [pk, setPk] = useState(null);
  const [unitData, setUnitData] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [selectedReference, setSelectedReference] = useState("");
  const [usfmHeader, setUsfmHeader] = useState("");
  const [savedChecksum, setSavedChecksum] = useState(null);
  const [openModalPreviewText, setOpenModalPreviewText] = useState(false)
  const [scriptureJson, setScriptureJson] = useState(null);
  const [data, setData] = useState(null);
  const [chapterNumbers, setChapterNumbers] = useState([]);
  const [currentBookCode, setCurrentBookCode] = useState("zzz");


  const handlePreviewText = () => {
    setOpenModalPreviewText(true)
  }

  useEffect(() => {
    const isElectron = !!window.electronAPI;
    if (isElectron) {
      window.electronAPI.setCanClose(!modified);
    }
  }, [modified]);

  const filterByChapter = (usfmJson, requiredChapter) => {
    let chapterBlocks = [];
    let currentChapter = 0;
    for (const block of usfmJson.blocks) {
      if (block.type === "chapter") {
        currentChapter = block.chapter
      }
      if (currentChapter === requiredChapter) {
        chapterBlocks.push(block)
      }
    }
    return {
      headers: usfmJson.headers,
      blocks: chapterBlocks
    }
  }

  const allChapters = (usfmJson) => {
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
      const doScriptureJson = async () => {
        let usfmResponse = await getText(`/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.usfm`,
          debugRef.current
        );
        if (usfmResponse.ok) {
          const usfmDraftJson = usfm2draftJson(usfmResponse.text)
          const newChapterNumbers = allChapters(usfmDraftJson)
          setCurrentBookCode(systemBcv.bookCode)
          setChapterNumbers(
            newChapterNumbers
          )
          postEmptyJson(
            `/navigation/bcv/${systemBcv.bookCode}/${newChapterNumbers[0]}/1`,
            debugRef.current);

        }
      }
      doScriptureJson().then();
    }

  }, [debugRef, systemBcv.bookCode, metadata,currentBookCode])

  useEffect(() => {
    const doScriptureJson = async () => {
      let usfmResponse = await getText(`/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.usfm`,
        debugRef.current
      );
      if (usfmResponse.ok) {
        const usfmDraftJson = usfm2draftJson(usfmResponse.text)
        setScriptureJson(
          filterByChapter(
            usfmDraftJson,
            systemBcv.chapterNum
          )
        )
      }
    }
    doScriptureJson().then();
  }, [debugRef, systemBcv.bookCode, metadata, systemBcv.chapterNum])

  useEffect(() => {
    const juxtaJson = async () => {
      let jsonResponse = await getJson(
        `/burrito/ingredient/raw/git.door43.org/BurritoTruck/fr_juxta/?ipath=${systemBcv.bookCode}.json`,
        debugRef.current
      );
      if (jsonResponse.ok) {
        let newUnits = juxta2Units(jsonResponse.json);
        setUnits(newUnits);
      } else {
        // Generate from Proskomma versification
        const vrsQuery = `{
                versification(id: "eng") {
                  cvBook(bookCode: "${systemBcv.bookCode}") {
                    chapters {
                      chapter
                      maxVerse
                    }
                  }
                }
                }`;
        const pk = new Proskomma();
        const result = pk.gqlQuerySync(vrsQuery);
        const chapters = result.data.versification.cvBook.chapters;
        setUnits(
          chapters
            .map((c) =>
              [...Array(c.maxVerse + 1).keys()]
                .map((c2) => `${c.chapter}:${c2}`)
                .slice(1)
            )
            .reduce((a, b) => [...a, ...b], [])
        );
      }
    };
    juxtaJson().then();
  }, [debugRef, systemBcv.bookCode]);

  if (isDownloading) {
    return <p>loading...</p>;
  }

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          top: "48px",
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
            <SaveButtonDrafting
              metadata={metadata}
              systemBcv={systemBcv}
              usfmHeader={usfmHeader}
              unitData={unitData}
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
          <Grid2 item size={4}>
            <NavBarDrafting
              chapterNumbers={chapterNumbers}
              metadata={metadata}
              systemBcv={systemBcv}
            />
          </Grid2>
          <Grid2 item size={2}>
            <BcvPicker />
          </Grid2>
          <Grid2 item size={2}>
            <CustomEditorMode
              editor={editorMode}
              setEditor={setEditor}
              modified={modified}
              setModified={setModified}
            />
          </Grid2>
        </Grid2>
      </Box>
      <Box>
        {scriptureJson ? (
          <>
            <ScriptureBible scriptureJson={scriptureJson} />
          </>

        ) : (<Typography> loading ...</Typography>)}
      </Box>
    </>
  );
}

export default DraftingEditor;
