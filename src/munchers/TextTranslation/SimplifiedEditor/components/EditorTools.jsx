import { Box, Grid2, IconButton, Tooltip } from "@mui/material";
import ChapterPicker from "./ChapterPicker";
import BookPicker from "./BookPicker";
import PreviewText from "./PreviewText";
import md5sum from "md5";
import { useContext, useEffect, useState } from "react";
import usfm2draftJson from "../../../../components/usfm2draftJson";
import { useNavigate } from "react-router-dom";
import LayoutIcon from "../layouts/LayoutIcon";
import { getText } from "pankosmia-lib/http";

import { enqueueSnackbar } from "notistack";
import { postJson, getJson, postEmptyJson } from "pankosmia-lib/http";
import { doI18n } from "pankosmia-lib/i18n";
import { getFirstChapterTextTranslation } from "../../../../common/findFirstChapter";
import {
  bcvContext as BcvContext,
  debugContext as DebugContext,
  i18nContext as I18nContext,
  productContext as ProductContext,
  currentProjectContext as CurrentProjectContext,
} from "pankosmia-rcl";
import { PrintOutlined } from "@mui/icons-material";
import draftJson2usfm from "../../../../components/draftJson2usfm";
import ToolbarComp from "../../../../components/ToolbarComp";

function EditorTools({
  metadata,
  modified,
  setModified,
  md5sumScriptureJson,
  setMd5sumScriptureJson,
  scriptureJson,
  currentBookCode,
  setCurrentBookCode,
}) {
  const { systemBcv, bcvRef } = useContext(BcvContext);
  const { debugRef } = useContext(DebugContext);
  const { i18nRef } = useContext(I18nContext);
  const { product } = useContext(ProductContext);
  const [openModalPreviewText, setOpenModalPreviewText] = useState(false);
  const [chapterNumbers, setChapterNumbers] = useState([]);
  const [contentBooks, setContentBooks] = useState([]);
  const [currentBook, setCurrentBook] = useState(bcvRef.current.bookCode);
  const { currentProjectRef } = useContext(CurrentProjectContext);

  const navigate = useNavigate();
  const actions = [
    {
      key: "bookPicker",
      type: "component",
      render: () => (
        <BookPicker setFirstChapter={getFirstChapterTextTranslation} />
      ),
    },
    {
      key: "bookPicker",
      type: "component",
      render: () => (
        <ChapterPicker
          chapterNumbers={chapterNumbers}
          repoMetadata={metadata}
        />
      ),
    },
    {
      key: "PreviewText",
      type: "component",
      onclick: () => {
        setOpenModalPreviewText(true);
      },
      render: () => (
        <PreviewText
          metadata={metadata}
          systemBcv={systemBcv}
          open={openModalPreviewText}
          setOpenModalPreviewText={setOpenModalPreviewText}
        />
      ),
    },
  ];

  const allChapterNumbers = (usfmJson) => {
    let chapters = [];
    for (const block of usfmJson.blocks) {
      if (block.type === "chapter") {
        chapters.push(block.chapter);
      }
    }
    return chapters;
  };
  useEffect(() => {
    if (systemBcv.bookCode !== currentBookCode) {
      const doChapterNumbers = async () => {
        let usfmResponse = await getText(
          `/api/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.usfm`,
          debugRef.current,
        );
        if (usfmResponse.ok) {
          const usfmDraftJson = await usfm2draftJson(usfmResponse.text);
          const newChapterNumbers = allChapterNumbers(usfmDraftJson);
          setCurrentBookCode(systemBcv.bookCode);
          setChapterNumbers(newChapterNumbers);
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

  // Set up '
  useEffect(() => {
    const getProjectBooks = async () => {
      if (currentProjectRef.current) {
        const projectPath = `${currentProjectRef.current.source}/${currentProjectRef.current.organization}/${currentProjectRef.current.project}`;
        const fullMetadataResponse = await getJson(
          `/api/burrito/metadata/summary/${projectPath}`,
          debugRef.current,
        );
        if (fullMetadataResponse.ok) {
          setContentBooks(fullMetadataResponse.json.book_codes);
        }
      }
    };
    getProjectBooks().then();
  }, [currentProjectRef]);

  useEffect(() => {
    if (currentBook && bcvRef.current.bookCode !== currentBook) {
      getFirstChapterTextTranslation(
        currentProjectRef.current,
        debugRef.current,
        currentBook,
      );
    }
  }, [currentBook]);

  // Set up 'are you sure you want to leave page' for Electron
  useEffect(() => {
    const isElectron = !!window.electronAPI;
    if (isElectron) {
      if (!(md5sum(JSON.stringify(scriptureJson)) === md5sumScriptureJson)) {
        window.electronAPI.setCanClose(false);
      } else {
        window.electronAPI.setCanClose(true);
      }
    }
  }, [scriptureJson, md5sumScriptureJson]);

  // Set up 'save' button
  const handleSaveUsfm = async (debugBool) => {
    let usfm = draftJson2usfm(scriptureJson);
    const payload = JSON.stringify({ payload: usfm });
    const response = await postJson(
      `/api/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.usfm`,
      payload,
      debugBool,
    );
    if (response.ok) {
      enqueueSnackbar(
        `${doI18n("pages:core-local-workspace:saved", i18nRef.current)}`,
        { variant: "success" },
      );
      setMd5sumScriptureJson(md5sum(JSON.stringify(scriptureJson)));
      setModified(false);
    } else {
      enqueueSnackbar(
        `${doI18n("pages:core-local-workspace:save_error", i18nRef.current)}: ${response.status}`,
        { variant: "error" },
      );
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: product && product.os == "android" ? "70px" : "40px",
        left: 0,
        right: 0,
        display: "flex",
        padding: "0.5rem",
      }}
    >
      <ToolbarComp
        flavorType={metadata.flavor_type}
        save={handleSaveUsfm}
        disabledSave={
          md5sum(JSON.stringify(scriptureJson)) === md5sumScriptureJson
        }
        disabledLayout={
          md5sum(JSON.stringify(scriptureJson)) !== md5sumScriptureJson
        }
        actions={actions}
      />
    </Box>
  );
}

export default EditorTools;
