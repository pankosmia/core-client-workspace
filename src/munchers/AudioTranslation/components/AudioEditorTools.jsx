import { Box, Grid2, IconButton, Tooltip } from "@mui/material";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { doI18n } from "pithekos-lib";
import { enqueueSnackbar } from "notistack";
import {
  i18nContext as I18nContext,
  debugContext as DebugContext,
} from "pankosmia-rcl";

import LayoutIcon from "../../TextTranslation/SimplifiedEditor/layouts/LayoutIcon";
import AudioCompileIcon from "../../OBS/components/AudioCompileIcon";
import AudioNavigator from "./AudioNavigator";

// Top toolbar for the audio translation editor, modelled on OBSEditorTools /
// TextTranslation EditorTools: a fixed bar with the navigator centred and the
// layout-edit button on the right.
function AudioEditorTools({ nav, compileAudio }) {
  const { i18nRef } = useContext(I18nContext);
  const { debugRef } = useContext(DebugContext);
  const navigate = useNavigate();

  const compileAudioHandler = async () => {
    try {
      await compileAudio();
      enqueueSnackbar(
        doI18n(
          "pages:core-local-workspace:audio_compiled",
          i18nRef.current,
          debugRef.current,
        ),
        { variant: "success" },
      );
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
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
        <Grid2 display="flex" gap={1} sx={{ flex: 1 }}>
          <Tooltip
            title={doI18n(
              "pages:core-local-workspace:button_generate_audio",
              i18nRef.current,
              debugRef.current,
            )}
          >
            <span>
              <IconButton
                disabled={!compileAudio}
                onClick={compileAudioHandler}
              >
                <AudioCompileIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Grid2>

        <Grid2 display="flex" justifyContent="center" gap={1} sx={{ flex: 1 }}>
          <AudioNavigator {...nav} />
        </Grid2>

        <Grid2
          display="flex"
          justifyContent="flex-end"
          gap={1}
          sx={{ flex: 1 }}
        >
          <Tooltip
            title={doI18n(
              "pages:core-local-workspace:button_edit_layout",
              i18nRef.current,
              debugRef.current,
            )}
          >
            <IconButton
              sx={{ transition: "color 0.3s ease" }}
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

export default AudioEditorTools;
