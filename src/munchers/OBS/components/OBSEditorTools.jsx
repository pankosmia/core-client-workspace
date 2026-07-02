import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import LayoutIcon from "../../TextTranslation/SimplifiedEditor/layouts/LayoutIcon.jsx";
import OBSNavigator from "./OBSNavigator";
import SaveOBSButton from "./SaveOBSButton";
import { Grid2, IconButton, Menu, MenuItem } from "@mui/material";
import { doI18n } from "pankosmia-lib/i18n";
import { useNavigate } from "react-router-dom";
import {
  i18nContext as I18nContext,
  debugContext as DebugContext,
} from "pankosmia-rcl";
import Switch from "@mui/material/Switch";
import { useContext } from "react";
import AudioCompileIcon from "./AudioCompileIcon";
import GeneratedAtLabel from "./GeneratedAtLabel";
import { enqueueSnackbar } from "notistack";

function OBSEditorTools({
  obs,
  setObs,
  isModified,
  handleSaveOBS,
  audioEnabled,
  setAudioEnabled,
  currentChapter,
  chapterTitle,
  handleExportVideoParagraph,
  isExportingParaEnabled,
  handleExportVideoStory,
  isMenuOpen,
  menuAnchorEl,
  setMenuAnchorEl,
  compileAudio,
  generatedAt,
}) {
  const { i18nRef } = useContext(I18nContext);
  const { debugRef } = useContext(DebugContext);

  const compileAudioHandler = async () => {
    try {
      // compileAudio renvoie false lorsqu'il court-circuite pour ouvrir le
      // modal FFmpeg : rien n'a été compilé, on n'affiche pas de succès.
      const compiled = await compileAudio();
      if (compiled === false) {
        return;
      }
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

  const navigate = useNavigate();
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
        <Grid2
          display="flex"
          alignItems="center"
          justifyContent="flex-start"
          gap={1}
          sx={{ flex: 1 }}
        >
          <SaveOBSButton
            obs={obs}
            isModified={isModified}
            handleSave={handleSaveOBS}
          />
          <Box sx={{ display: "flex", alignItems: "center" }}>
            Audio
            <Switch
              checked={audioEnabled}
              onChange={() => setAudioEnabled(!audioEnabled)}
            />
          </Box>
          <Tooltip
            title={doI18n(
              "pages:core-local-workspace:button_generate_audio",
              i18nRef.current,
              debugRef.current,
            )}
          >
            <IconButton onClick={compileAudioHandler}>
              <AudioCompileIcon />
            </IconButton>
          </Tooltip>
          <GeneratedAtLabel date={generatedAt} />
          <IconButton
            id="obs-export-button"
            aria-controls={isMenuOpen ? "obs-export-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={isMenuOpen ? "true" : undefined}
            onClick={(event) => setMenuAnchorEl(event.currentTarget)}
          >
            <ImportExportIcon />
          </IconButton>
          <Menu
            id="obs-export-menu"
            anchorEl={menuAnchorEl}
            open={isMenuOpen}
            onClose={() => setMenuAnchorEl(null)}
            slotProps={{ list: { "aria-labelledby": "obs-export-button" } }}
          >
            <MenuItem
              onClick={() => handleExportVideoParagraph()}
              disabled={!isExportingParaEnabled}
            >
              Export video paragraph
            </MenuItem>
            <MenuItem onClick={() => handleExportVideoStory()}>
              Export video story
            </MenuItem>
          </Menu>
        </Grid2>

        <Grid2 display="flex" justifyContent="center" gap={1} sx={{ flex: 1 }}>
          <OBSNavigator max={currentChapter.length - 1} title={chapterTitle} />
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
              disabled={isModified(obs[0])}
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

export default OBSEditorTools;
