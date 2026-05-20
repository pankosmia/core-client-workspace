import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import LayoutIcon from "../../TextTranslation/SimplifiedEditor/layouts/LayoutIcon.jsx";
import OBSNavigator from "./OBSNavigator";
import SaveOBSButton from "./SaveOBSButton";
import { Grid2, IconButton, Menu, MenuItem } from "@mui/material";
import { doI18n } from "pithekos-lib";
import md5sum from "md5";
import { useNavigate } from "react-router-dom";
import { getText } from "pithekos-lib";
import usfm2draftJson from "../../../components/usfm2draftJson";
import {
  i18nContext as I18nContext,
  debugContext as DebugContext,
} from "pankosmia-rcl";
import Switch from "@mui/material/Switch";
import { useContext } from "react";

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
}) {
  const { i18nRef } = useContext(I18nContext);
  const { debugRef } = useContext(DebugContext);

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
        zIndex: 1100,
        backgroundColor: "background.paper",
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
              disabled={
                md5sum(JSON.stringify(obs)) !== md5sum(JSON.stringify(obs))
              }
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
