import { IconButton } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import md5sum from "md5";
import { doI18n, postJson } from "pithekos-lib";
import { enqueueSnackbar } from "notistack";
import { useContext } from "react";
import draftJson2usfm from "../../../../components/draftJson2usfm";
import { useEffect } from "react";
import { i18nContext as I18nContext } from "pankosmia-rcl";

function SaveButton({
  metadata,
  systemBcv,
  modified,
  setModified,
  md5sumScriptureJson,
  setMd5sumScriptureJson,
  scriptureJson,
}) {
  const { i18nRef } = useContext(I18nContext);
  useEffect(() => {
    const isElectron = !!window.electronAPI;
    if (isElectron) {
      console.log("ici");
      if (!(md5sum(JSON.stringify(scriptureJson)) === md5sumScriptureJson)) {
        window.electronAPI.setCanClose(false);
      } else {
        window.electronAPI.setCanClose(true);
      }
    }
  }, [scriptureJson, md5sumScriptureJson]);
  // Permet de sauvegarder dans le fichier TSV
  const handleSaveUsfm = async (debugBool) => {
    let usfm = draftJson2usfm(scriptureJson);
    const payload = JSON.stringify({ payload: usfm });
    const response = await postJson(
      `/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.usfm`,
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
    <IconButton
      variant="contained"
      onClick={() => {
        handleSaveUsfm().then();
      }}
      disabled={md5sum(JSON.stringify(scriptureJson)) === md5sumScriptureJson}
    >
      <SaveIcon size="large" />
    </IconButton>
  );
}
export default SaveButton;
