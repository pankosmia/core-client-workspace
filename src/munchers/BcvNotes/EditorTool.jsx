import TollbarComp from "../../components/ToolbarComp";
import BookPicker from "../../components/BookPicker";
import NotesChapterPicker from "./components/NotesChapterPicker";
import { useContext, useState } from "react";
import {
  i18nContext as I18nContext,
  debugContext as DebugContext,
  bcvContext as BcvContext,
} from "pankosmia-rcl";
import { postJson } from "pankosmia-lib/http";
import { doI18n } from "pankosmia-lib/i18n";
import md5 from "md5";

export default function EditorTool({
  metadata,
  ingredient,
  setIngredient,
  md5Ingredient,
  setMd5Ingredient,
}) {
  const { systemBcv } = useContext(BcvContext);
  const { i18nRef } = useContext(I18nContext);
  const [contentChanged, _setContentChanged] = useState(false);
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
        <NotesChapterPicker
          ingredient={ingredient}
          currentChapter={currentChapter}
          setCurrentChapter={setCurrentChapter}
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
  // Met à jour le fichier TSV
  const uploadTsvIngredient = async (tsvData, debugBool) => {
    const tsvString = tsvData
      .map((r) => r.map((c) => c.replace(/\n/g, "\\n")))
      .map((r) => r.join("\t"))
      .filter((r) => r.trim().length > 0)
      .join("\n");
    const payload = JSON.stringify({ payload: tsvString });
    const response = await postJson(
      `/api/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.tsv`,
      payload,
      debugBool,
    );
    if (response.ok) {
      enqueueSnackbar(
        `${doI18n("pages:core-local-workspace:saved", i18nRef.current)}`,
        { variant: "success" },
      );
      setContentChanged(false);
    } else {
      enqueueSnackbar(
        `${doI18n("pages:core-local-workspace:save_error", i18nRef.current)}: ${response.status}`,
        { variant: "error" },
      );
      throw new Error(`Failed to save: ${response.status}, ${response.error}`);
    }
  };

  // Montre le changement d'état du contenu
  const setContentChanged = (nv) => {
    _setContentChanged(nv);
  };
  // Permet de sauvegarder dans le fichier TSV
  const handleSaveTsv = () => {
    setMd5Ingredient(md5(JSON.stringify(ingredient)));
    uploadTsvIngredient([...ingredient]);
  };
  return (
    <TollbarComp
      save={handleSaveTsv}
      disabledSave={md5(JSON.stringify(ingredient)) === md5Ingredient}
      disabledLayout={md5(JSON.stringify(ingredient)) !== md5Ingredient}
    />
  );
}
