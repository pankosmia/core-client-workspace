import { useEffect, useState, useContext, useCallback } from "react";
import { Box, Stack, Grid2, Typography } from "@mui/material";
import {
  i18nContext as I18nContext,
  debugContext as DebugContext,
  bcvContext as BcvContext,
} from "pankosmia-rcl";
import { getText, postEmptyJson, doI18n } from "pithekos-lib";
import SearchWithVerses from "./components/SearchWithVerses";
import Editor from "./components/Editor";
import AddFab from "./components/AddFab";
import SaveTsvButton from "./components/SaveTsvButton";
import md5 from "md5";
import BookPicker from "../TextTranslation/SimplifiedEditor/components/BookPicker";
import NotesChapterPicker from "./components/NotesChapterPicker";
import { getFirstChapterBCVNotes } from "../../common/findFirstChapter";
function BcvNotesEditorMuncher({ metadata }) {
  const [ingredient, setIngredient] = useState([]);
  const { systemBcv } = useContext(BcvContext);
  const { debugRef } = useContext(DebugContext);
  const { i18nRef } = useContext(I18nContext);
  const [currentRowN, setCurrentRowN] = useState(1);
  const [md5Ingredient, setMd5Ingredient] = useState([]);
  const [cellValueChanged, setCellValueChanged] = useState(false);
  const [currentChapter, setCurrentChapter] = useState("1");
  const [refDisabled, setRefDisabled] = useState(false);
  const [resourceType, setResourceType] = useState("new_bcv_note");

  // Récupération des données du tsv
  const getAllData = async () => {
    const ingredientLink = `/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.tsv`;
    let response = await getText(ingredientLink, debugRef.current);
    if (response.ok) {
      const newIngredient = response.text
        .split("\n")
        .map((l) => l.split("\t").map((f) => f.replace(/(\\n){2,}/g, "\n\n")));
      setIngredient(newIngredient);
      const hash = md5(JSON.stringify(newIngredient));
      setMd5Ingredient(hash);
    }
  };
  // utilisation de la fonction getAllData
  useEffect(() => {
    getAllData().then();
  }, [systemBcv.bookCode]);

  const updateBcv = (rowN) => {
    const newCurrentRow = ingredient[rowN][0];
    if (newCurrentRow[0]) {
      const newCurrentRowCV = newCurrentRow.split(":");
      if (newCurrentRowCV.length === 2) {
        postEmptyJson(
          `/navigation/bcv/${systemBcv["bookCode"]}/${newCurrentRowCV[0]}/${newCurrentRowCV[1].split("-")[0]}`,
          debugRef.current,
        );
      }
    }
  };

  const isModified = useCallback(() => {
    const originalChecksum = md5Ingredient;
    if (!originalChecksum) {
      return false;
    }
    const currentChecksum = md5(JSON.stringify(ingredient));
    return originalChecksum !== currentChecksum;
  }, [ingredient, md5Ingredient]);
  useEffect(() => {
    const isElectron = !!window.electronAPI;
    if (isElectron) {
      if (isModified()) {
        window.electronAPI.setCanClose(false);
      } else {
        window.electronAPI.setCanClose(true);
      }
    }
  }, [isModified]);

  const notesExist = currentChapter
    ? ingredient.filter((l) => l[0].startsWith(`${currentChapter}:`))
    : [];

  /* useEffect that detects which resource we're printing, checks if it's translationNotes, translationQuestions or Study questions, then we use the value of resourceType to print the fields inside of TsvLineForm */
  useEffect(() => {
    if (!ingredient || ingredient.length < 2) {
      return;
    }

    const header = ingredient[0].join(" ").toLowerCase();
    const firstRow = ingredient[1].join(" ").toLowerCase();

    if (header.includes("note")) {
      setResourceType("new_bcv_note");
      return;
    }

    if (firstRow.includes("front:intro")) {
      if (firstRow.includes("study")) {
        setResourceType("new_bcv_study_question");
      } else {
        setResourceType("new_bcv_question");
      }
      return;
    }

    if (header.includes("response")) {
      setResourceType("new_bcv_question");
    } else if (header.includes("question")) {
      setResourceType("new_bcv_study_question");
    } else {
      setResourceType("new_bcv_note");
    }
  }, [ingredient]);

  return (
    <Stack
      sx={{
        padding: 2,
      }}
    >
      {/* <SearchNavBar getAllData={getAllData} /> */}
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
          alignItems="flex-start"
          justifyContent="flex-start"
          width="100%"
        >
          <Grid2 item size={6}>
            <SaveTsvButton
              metadata={metadata}
              ingredient={ingredient}
              setIngredient={setIngredient}
              md5Ingredient={md5Ingredient}
              setMd5Ingredient={setMd5Ingredient}
            />
          </Grid2>
          <Grid2 item size={6} display="flex" gap={1}>
            <BookPicker setFirstChapter={getFirstChapterBCVNotes} />
            <NotesChapterPicker
              ingredient={ingredient}
              currentChapter={currentChapter}
              setCurrentChapter={setCurrentChapter}
            />
          </Grid2>
        </Grid2>
      </Box>
      {notesExist.length > 0 ? (
        <Box sx={{ display: "flex", gap: 2, flexGrow: 1, padding: 2 }}>
          <SearchWithVerses
            ingredient={ingredient}
            setIngredient={setIngredient}
            currentRowN={currentRowN}
            setCurrentRowN={setCurrentRowN}
            cellValueChanged={cellValueChanged}
            setCellValueChanged={setCellValueChanged}
            updateBcv={updateBcv}
            currentChapter={currentChapter}
            refDisabled={refDisabled}
            setRefDisabled={setRefDisabled}
            resourceType={resourceType}
          />
          <Editor
            currentRowN={currentRowN}
            setCurrentRowN={setCurrentRowN}
            ingredient={ingredient}
            setIngredient={setIngredient}
            updateBcv={updateBcv}
            cellValueChanged={cellValueChanged}
            setCellValueChanged={setCellValueChanged}
            refDisabled={refDisabled}
            setRefDisabled={setRefDisabled}
            resourceType={resourceType}
          />
        </Box>
      ) : (
        <Box sx={{ display: "flex", gap: 2, flexGrow: 1, padding: 2 }}>
          <Stack spacing={2}>
            <AddFab
              currentRowN={currentRowN}
              setCurrentRowN={setCurrentRowN}
              ingredient={ingredient}
              setIngredient={setIngredient}
              cellValueChanged={cellValueChanged}
              setCellValueChanged={setCellValueChanged}
              refDisabled={refDisabled}
              setRefDisabled={setRefDisabled}
              resourceType={resourceType}
            />
            <Typography>
              {doI18n("pages:core-local-workspace:no_notes", i18nRef.current)}
            </Typography>
          </Stack>
        </Box>
      )}
    </Stack>
  );
}

export default BcvNotesEditorMuncher;
