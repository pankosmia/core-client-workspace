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
import { Box, Divider, FormControl, Grid2, IconButton, TextField, Typography } from "@mui/material";
import RequireResources from "../../../components/RequireResources";
import juxta2Units from "../../../components/juxta2Units";
import NavBarDrafting from "./components/NavBarDrafting";
import SaveButtonDrafting from "./components/SaveButtonDrafting";
import CustomEditorMode from "../CustomEditorMode";
import BcvPicker from "../../../pages/Workspace/BcvPicker";
import PreviewText from "./PreviewText";
import VisibilityIcon from '@mui/icons-material/Visibility';
import usfm2draftJson from '../../../components/usfm2draftJson';
import StoryChapter from "./components/StoryChapter";

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
  const [currentChapter, setCurrentChapter] = useState(1);
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

  const handlePreviewText = () => {
    setOpenModalPreviewText(true)
  }

  useEffect(() => {
    const isElectron = !!window.electronAPI;
    if (isElectron) {
      window.electronAPI.setCanClose(!modified);
    }
  }, [modified]);

  const updateBcv = (unitN) => {
    if (unitData[unitN]) {
      const newCurrentUnitCV = unitData[unitN].reference.split(":");
      postEmptyJson(
        `/navigation/bcv/${systemBcv["bookCode"]}/${newCurrentUnitCV[0]}/${newCurrentUnitCV[1].split("-")[0]
        }`,
        debugRef.current
      );
    }
  };

  useEffect(() => {
    const doScriptureJson = async () => {
      let usfmResponse = await getText(`/burrito/ingredient/raw/_local_/_local_/en_web?ipath=${systemBcv.bookCode}.usfm`,
        debugRef.current
      );
      if (usfmResponse.ok) {
        setScriptureJson(usfm2draftJson(usfmResponse.text))
      }
    }
    doScriptureJson().then();
  }, [debugRef, systemBcv.bookCode])

  console.log("scriptureJson", scriptureJson);

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

  useEffect(() => {
    const getProskomma = async () => {
      let usfmResponse = await getText(
        `/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.usfm`,
        debugRef.current
      );
      if (usfmResponse.ok) {
        const usfmText = usfmResponse.text;
        usfm2draftJson(usfmText);
        setUsfmHeader(usfmText.split("\\c")[0]);
        const newPk = new Proskomma();
        newPk.importDocument(
          {
            lang: "xxx",
            abbr: "yyy",
          },
          "usfm",
          usfmText
        );
        setPk(newPk);
      }
    };
    getProskomma().then();
  }, [debugRef, systemBcv.bookCode, metadata.local_path]);
  const getUnitTexts = async () => {
    let newUnitData = [];
    setIsDownloading(true);
    for (const cv of units) {
      const query = `{
                documents {
                    mainSequence {
                        blocks(withScriptureCV:"${cv}"){
                            items(withScriptureCV:"${cv}") {
                                type subType payload
                            }
                        }
                    }

                }
            }`;
      const result = await pk.gqlQuery(query);
      const cvText = result.data.documents[0].mainSequence.blocks
        .map((b) =>
          b.items
            .filter((i) => i.type === "token")
            .map((i) => i.payload.replace(/\s+/g, " "))
            .join("")
        )
        .join("\n\n");
      newUnitData.push({ reference: cv, text: cvText });
    }
    setUnitData(newUnitData);
    setIsDownloading(false);
    setModified(false);
    setSavedChecksum(md5(JSON.stringify(newUnitData, null, 2)));
  };
  useEffect(() => {
    if (pk) {
      getUnitTexts().then();
    }
  }, [units, pk]);

  const handleCacheUnit = (unitN, newText) => {
    const newUnit = { ...unitData[unitN], text: newText };
    let newUnitData = [...unitData];
    newUnitData[unitN] = newUnit;
    const newChecksum = md5(JSON.stringify(newUnitData, null, 2));
    const notSaved = newChecksum !== savedChecksum;
    if (notSaved !== modified) {
      setModified(notSaved);
    }
    setUnitData(newUnitData);
  };

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
              currentChapter={currentChapter}
              setCurrentChapter={setCurrentChapter}
              units={units}
              metadata={metadata}
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
          <StoryChapter scriptureJson={scriptureJson} />

        ) : (<Typography> loading ...</Typography>)}

        {unitData.map((u, index) => {
          if (!u.reference.startsWith(`${currentChapter}:`)) {
            return;
          }
          return (
            <Box key={index}>
              <FormControl fullWidth margin="normal">

                <TextField
                  label={u.reference}
                  value={
                    u.reference === selectedReference ? currentText : u.text
                  }
                  multiline
                  minRows={6}
                  maxRows={9}
                  autoFocus={u.reference === selectedReference}
                  onFocus={() => {
                    setCurrentText(u.text);
                    setSelectedReference(u.reference);
                    updateBcv(index);
                  }}
                  onChange={(e) => {
                    setCurrentText(e.target.value);
                  }}
                  onBlur={() => handleCacheUnit(index, currentText)}
                />
              </FormControl>
            </Box>
          );
        })}
      </Box>
    </>
  );
}

export default DraftingEditor;
