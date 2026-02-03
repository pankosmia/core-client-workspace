import { Box, Grid2, IconButton } from "@mui/material";
import SaveButton from "../../../TextTranslation/SimplifiedEditor/components/SaveButton";
import BookPicker from "../../../TextTranslation/SimplifiedEditor/components/BookPicker";
import md5sum from "md5";
import { useContext, useEffect, useState } from "react";
import { getJson, getText, postEmptyJson } from "pithekos-lib";
import usfm2draftJson from "../../../../components/usfm2draftJson";
import { useNavigate } from "react-router-dom";
import JuxtaSentencesNav from "./JuxtaSentencesNav";
import {
  bcvContext as BcvContext,
  debugContext as DebugContext,
} from "pankosmia-rcl";

function JuxtaEditorTools({
  metadata,
  modified,
  setModified,
  md5sumScriptureJson,
  setMd5sumScriptureJson,
  scriptureJson,
  currentBookCode,
  setCurrentBookCode,
  curIndex,
  setCurIndex,
  sentences,
}) {
  const { systemBcv } = useContext(BcvContext);
  const { debugRef } = useContext(DebugContext);
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
    if (systemBcv.bookCode !== currentBookCode) {
      const doChapterNumbers = async () => {
        let jsonResponse = await getJson(
          `/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.json`,
          debugRef.current,
        );
        if (jsonResponse.ok) {
          const JsonDraft = jsonResponse.json;
          setCurrentBookCode(systemBcv.bookCode);
        }
      };
      doChapterNumbers().then();
    }
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
          <SaveButton
            metadata={metadata}
            systemBcv={systemBcv}
            modified={modified}
            setModified={setModified}
            md5sumScriptureJson={md5sumScriptureJson}
            setMd5sumScriptureJson={setMd5sumScriptureJson}
            scriptureJson={scriptureJson}
          />
        </Grid2>

        <Grid2 display="flex" gap={1}>
          <BookPicker json={true} />
          <JuxtaSentencesNav
            onPrevHandler={onPrevHandler}
            onNextHandler={onNextHandler}
            indexChangeHandler={indexChangeHandler}
            sentences={sentences}
            currentChapter={currentChapter}
            startVerse={startVerse}
            curIndex={curIndex}
            endVerse={endVerse}
          />
        </Grid2>
        <Grid2 display="flex" gap={1}></Grid2>
      </Grid2>
    </Box>
  );
}

export default JuxtaEditorTools;
