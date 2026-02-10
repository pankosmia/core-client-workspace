import { Box, Grid2, IconButton, Tooltip } from "@mui/material";
import LayoutIcon from "../../../TextTranslation/SimplifiedEditor/layouts/LayoutIcon";
import SaveButton from "../../../TextTranslation/SimplifiedEditor/components/SaveButton";
import BookPicker from "../../../TextTranslation/SimplifiedEditor/components/BookPicker";
import md5sum from "md5";
import { useContext, useEffect, useState } from "react";
import { getJson, getText, postEmptyJson, doI18n } from "pithekos-lib";
import usfm2draftJson from "../../../../components/usfm2draftJson";
import { useNavigate } from "react-router-dom";
import JuxtaSaveButton from "./JuxtaSaveButton";
import JuxtaSentencesNav from "./JuxtaSentencesNav";
import { getFirstChapterJuxta } from "../../../../common/findFirstChapter";
import {
  bcvContext as BcvContext,
  debugContext as DebugContext,
  i18nContext,
} from "pankosmia-rcl";

function JuxtaEditorTools({
  metadata,
  md5sumScriptureJson,
  setMd5sumScriptureJson,
  currentBookCode,
  setCurrentBookCode,
  curIndex,
  setCurIndex,
  sentences,
}) {
  const { systemBcv } = useContext(BcvContext);
  const { debugRef } = useContext(DebugContext);
  const { i18nRef } = useContext(i18nContext);
  const [modified, setModified] = useState(false);
  console.log(modified);
  const navigate = useNavigate();
  useEffect(() => {
    postEmptyJson(
      `/navigation/bcv/${currentBookCode}/${currentChapter()}/${startVerse()}`,
      debugRef.current,
    );
  }, [curIndex]);
  const onPrevHandler = () => {
    if (curIndex > 0) {
      setCurIndex(curIndex - 1);
    }
  };

  const onNextHandler = () => {
    if (curIndex < sentences.length - 1) {
      setCurIndex(curIndex + 1);
    }
  };

  const firstSource = () => {
    if (
      !sentences.length ||
      !sentences[curIndex].chunks[0]?.source.length ||
      sentences[curIndex].chunks[0]?.source[0] === null
    ) {
      return null;
    }
    return sentences[curIndex].chunks[0]?.source[0];
  };

  const lastSource = () => {
    if (
      !sentences.length ||
      !sentences[curIndex].chunks.slice(-1)[0]?.source.length ||
      sentences[curIndex].chunks.slice(-1)[0]?.source[0] === null
    ) {
      return null;
    }
    return sentences.length
      ? sentences[curIndex].chunks.slice(-1)[0]?.source.slice(-1)[0]
      : null;
  };
  const currentChapter = () => firstSource()?.cv.split(":")[0] ?? 0;

  const startVerse = () => firstSource()?.cv.split(":")[1] ?? 0;

  const endVerse = () => lastSource()?.cv.split(":")[1] ?? 0;

  // Set up chapter numbers when changing book

  useEffect(() => {
    const doChapterNumbers = async () => {
      if (systemBcv?.bookCode && systemBcv.bookCode !== currentBookCode) {
        let jsonResponse = await getJson(
          `/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.json`,
          debugRef.current,
        );
        if (jsonResponse.ok) {
          const JsonDraft = jsonResponse.json;
          setCurrentBookCode(systemBcv.bookCode);
        }
      }
    };
    doChapterNumbers().then();
  }, [
    systemBcv.bookCode,
    metadata,
    currentBookCode,
    setCurrentBookCode,
    debugRef,
  ]);
  const indexChangeHandler = (e) => {
    const index = parseInt(e.target.value);
    if (index > 0 && index <= sentences.length) {
      setCurIndex(index - 1);
    }
  };
  useEffect(() => {
    const isElectron = !!window.electronAPI;
    if (isElectron) {
      if (modified) {
        window.electronAPI.setCanClose(false);
      } else {
        window.electronAPI.setCanClose(true);
      }
    }
  }, [modified]);

  useEffect(() => {
    setModified(
      sentences.length > 0
        ? md5sum(JSON.stringify(sentences[curIndex])) !== md5sumScriptureJson
        : true,
    );
  }, [curIndex, md5sumScriptureJson,sentences]);
  return (
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
        <Grid2 display="flex" gap={1}>
          <JuxtaSaveButton
            metadata={metadata}
            systemBcv={systemBcv}
            modified={!modified}
            md5sumScriptureJson={md5sumScriptureJson}
            setMd5sumScriptureJson={setMd5sumScriptureJson}
            sentences={sentences}
            curIndex={curIndex}
          />
        </Grid2>

        <Grid2 display="flex" gap={1}>
          <BookPicker setFirstChapter={getFirstChapterJuxta} />
          <JuxtaSentencesNav
            onPrevHandler={onPrevHandler}
            onNextHandler={onNextHandler}
            indexChangeHandler={indexChangeHandler}
            sentences={sentences}
            currentChapter={currentChapter}
            startVerse={startVerse}
            curIndex={curIndex}
            endVerse={endVerse}
            modified={modified}
          />
        </Grid2>
        <Grid2 display="flex" gap={1}>
          <Tooltip
            title={doI18n(
              "pages:core-local-workspace:button_edit",
              i18nRef.current,
              debugRef.current,
            )}
          >
            <IconButton
              disabled={modified}
              /* enables redirection based on the page */
              onClick={() =>
                navigate({
                  pathname: "/",
                  search: "return-page=workspace",
                })
              }
            >
              <LayoutIcon />
            </IconButton>
          </Tooltip>
        </Grid2>
      </Grid2>
    </Box>
  );
}

export default JuxtaEditorTools;
