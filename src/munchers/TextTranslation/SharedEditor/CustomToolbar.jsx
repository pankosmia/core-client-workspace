import { useContext, useMemo, useState } from "react";
import { FindReplaceDialog } from "./FindReplaceDialog";
import "./custom-editor.css";
import {
  FindReplacePlugin,
  FormatButton,
  RedoButton,
  SaveButton,
  ScripturalNodesMenuPlugin,
  UndoButton,
  useFindReplace,
  ViewButton,
} from "@scriptural/react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import CustomMarkersToolbar from "../plugins/CustomMarkersToolbar";
import { TriggerKeyDialog } from "./TriggerKeyDialog";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardCommandKeyIcon from "@mui/icons-material/KeyboardCommandKey";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import WrapTextOutlinedIcon from "@mui/icons-material/WrapTextOutlined";
import { Divider, ToggleButton, IconButton, Box, Grid2 } from "@mui/material";
import { i18nContext as I18nContext, doI18n } from "pithekos-lib";
import SvgParaph from "../plugins/Svg_paraph";
import ChangeEditor from "../ChangeEditor";
import BcvPicker from "../../../pages/Workspace/BcvPicker";

function SearchButton() {
  const { isVisible, setIsVisible } = useFindReplace();
  const { i18nRef } = useContext(I18nContext);

  return (
    <button
      onClick={() => setIsVisible(!isVisible)}
      title={doI18n("pages:core-local-workspace:search_tool", i18nRef.current)}
      className="toolbar-button"
    >
      <SearchIcon />
    </button>
  );
}

function TriggerKeyButton({ triggerKeyCombo, onClick, className }) {
  const { i18nRef } = useContext(I18nContext);

  return (
    <button
      className={"toolbar-button " + (className ? className : "")}
      onClick={onClick}
      title={doI18n(
        "pages:core-local-workspace:key_combination",
        i18nRef.current
      )}
    >
      <KeyboardCommandKeyIcon />
      <span style={{ marginLeft: "4px", fontSize: "12px" }}>
        {triggerKeyCombo}
      </span>
    </button>
  );
}

export function CustomToolbar({
  onSave,
  modified,
  setModified,
  setEditor,
  editorMode,
}) {
  const [editor] = useLexicalComposerContext();
  const editable = useMemo(() => editor.isEditable(), [editor]);
  const [triggerKeyCombo, setTriggerKeyCombo] = useState("\\");
  const [isDialogOpenTriggerKey, setIsDialogOpenTriggerKey] = useState(false);
  const [formats, setFormats] = useState(() => [""]);
  const { i18nRef } = useContext(I18nContext);
  const [activeView, setActiveView] = useState(null);

  // Define the markers to show in the toolbar
  const markerGroups = {
    ChapterVerse: ["c", "v"],
    Prose: ["p", "m"],
    Poetry: ["q1", "q2"],
    Headings: ["mt", "s", "s2", "s3"],
  };

  const openDialog = () => {
    setIsDialogOpenTriggerKey(true);
  };

  const closeDialog = () => {
    setIsDialogOpenTriggerKey(false);
  };
  const handleFormat = (event, newFormats) => {
    setFormats(newFormats);
  };

  return (
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
      <TriggerKeyDialog
        isOpen={isDialogOpenTriggerKey}
        onClose={closeDialog}
        currentTrigger={triggerKeyCombo}
        onTriggerChange={setTriggerKeyCombo}
      />

      {editable ? (
        <FindReplacePlugin>
          <Grid2
            container
            spacing={2}
            justifyContent="space-between"
            alignItems="stretch"
            width="100%"
          >
            <Grid2 item size={4}>
              <ToggleButtonGroup
                value={formats}
                onChange={handleFormat}
                aria-label="text formatting"
                size="small"
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    borderRadius: 4,
                  }}
                >
                  <IconButton sx={{ padding: 0, margin: 0 }}>
                    <UndoButton
                      className="paddingButtonNavBar"
                      title={doI18n(
                        "pages:core-local-workspace:undo",
                        i18nRef.current
                      )}
                    >
                      <UndoIcon />
                    </UndoButton>
                  </IconButton>

                  <IconButton sx={{ padding: 0, margin: 0 }}>
                    <RedoButton
                      className="paddingButtonNavBar"
                      title={doI18n(
                        "pages:core-local-workspace:redo",
                        i18nRef.current
                      )}
                    >
                      <RedoIcon />
                    </RedoButton>
                  </IconButton>
                  <Divider
                    flexItem
                    orientation="vertical"
                    sx={{ mx: 0.5, my: 1 }}
                  />

                  <IconButton
                    disabled={!modified}
                    sx={{ padding: 0, margin: 0 }}
                  >
                    <SaveButton
                      className="paddingButtonNavBar"
                      onSave={onSave}
                      title={doI18n(
                        "pages:core-local-workspace:add",
                        i18nRef.current
                      )}
                    >
                      <SaveIcon />
                    </SaveButton>
                  </IconButton>
                  <Divider
                    flexItem
                    orientation="vertical"
                    sx={{ mx: 0.5, my: 1 }}
                  />

                  {/* <ButtonExpandNotes defaultState={false} /> */}
                  <IconButton sx={{ padding: 0, margin: 0 }}>
                    <TriggerKeyButton
                      className="paddingButtonNavBar"
                      triggerKeyCombo={triggerKeyCombo}
                      onClick={openDialog}
                    />
                  </IconButton>

                  <IconButton sx={{ padding: 0, margin: 0 }}>
                    <SearchButton className="paddingButtonNavBar" />
                  </IconButton>
                  <Divider
                    flexItem
                    orientation="vertical"
                    sx={{ mx: 0.5, my: 1 }}
                  />

                  <ToggleButton
                    value={"block_view"}
                    sx={{ border: 0, padding: 0, margin: 0 }}
                  >
                    <ViewButton
                      className="paddingButtonNavBar"
                      title={doI18n(
                        "pages:core-local-workspace:toggle_block_view",
                        i18nRef.current
                      )}
                    >
                      <WrapTextOutlinedIcon />
                    </ViewButton>
                  </ToggleButton>

                  <ToggleButton
                    value={"toggle_markup"}
                    sx={{ border: 0, padding: 0, margin: 0 }}
                  >
                    <FormatButton
                      className="paddingButtonNavBar"
                      title={doI18n(
                        "pages:core-local-workspace:toggle_markup",
                        i18nRef.current
                      )}
                    >
                      <SvgParaph />
                    </FormatButton>
                  </ToggleButton>
                </Box>
                <Divider
                  flexItem
                  orientation="vertical"
                  sx={{ mx: 0.5, my: 1 }}
                />
                {/* <CustomMarkersToolbar
                  customMarkers={markerGroups}
                  doI18n={doI18n}
                  i18nRef={i18nRef}
                /> */}
              </ToggleButtonGroup>
            </Grid2>
            <Grid2 item size={4}>
              <BcvPicker/>
            </Grid2>
            <Grid2 item size={4}>
              <ChangeEditor
                editor={editorMode}
                setEditor={setEditor}
                modified={modified}
                setModified={setModified}
              />
            </Grid2>
          </Grid2>

          {/* The FindReplaceDialog is also a child of FindReplacePlugin */}
          <FindReplaceDialog />
          <ScripturalNodesMenuPlugin trigger={triggerKeyCombo} />
        </FindReplacePlugin>
      ) : null}
    </Box>
  );
}
