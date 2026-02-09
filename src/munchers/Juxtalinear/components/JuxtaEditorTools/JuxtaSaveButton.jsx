import { IconButton } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import md5sum from "md5";
import { doI18n, postJson } from "pithekos-lib";
import { enqueueSnackbar } from "notistack";
import { useContext } from "react";
import draftJson2usfm from "../../../../components/draftJson2usfm";
import { useEffect } from "react";
import { i18nContext as I18nContext } from "pankosmia-rcl";

function JuxtaSaveButton({
  metadata,
  systemBcv,
  modified,
  setModified,
  md5sumScriptureJson,
  setMd5sumScriptureJson,
  sentences,
  curIndex
}) {
  const { i18nRef } = useContext(I18nContext);

  const handleSaveJson = async (debugBool) => {
    const s = [...sentences]
     s[0].chunks.filter(({source}) => source[0]).forEach(({ source }) => {
      source.filter(e => e);
    });
    const payload = JSON.stringify({ payload: s });
    const response = await postJson(
      `/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.json`,
      payload,
      debugBool,
    );
    if (response.ok) {
      enqueueSnackbar(
        `${doI18n("pages:core-local-workspace:saved", i18nRef.current)}`,
        { variant: "success" },
      );
      setMd5sumScriptureJson(md5sum(JSON.stringify(s[curIndex])));
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
        handleSaveJson().then();
      }}
      disabled={modified}
    >
      <SaveIcon size="large" />
    </IconButton>
  );
}
export default JuxtaSaveButton;
