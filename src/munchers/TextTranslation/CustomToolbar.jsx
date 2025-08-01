import { useMemo, useState } from "react";
import { FindReplaceDialog } from "./FindReplaceDialog";

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
import CustomMarkersToolbar from "./plugins/CustomMarkersToolbar";
import { TriggerKeyDialog } from "./TriggerKeyDialog";
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardCommandKeyIcon from '@mui/icons-material/KeyboardCommandKey';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import FormatTextdirectionRToLIcon from '@mui/icons-material/FormatTextdirectionRToL';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Divider, ToggleButton, Stack, IconButton, } from "@mui/material";

function SearchButton() {
  const { isVisible, setIsVisible } = useFindReplace();

  return (
    <button
      onClick={() => setIsVisible(!isVisible)}
      title="find and replace"
      className="toolbar-button"
    >
      <SearchIcon size={18} />
    </button>
  );
}

function TriggerKeyButton({
  triggerKeyCombo,
  onClick,
  className,
}) {
  return (
    <button
      className={"toolbar-button " + (className ? className : "")}
      onClick={onClick}
      title="Set trigger key combination"
    >
      <KeyboardCommandKeyIcon size={18} />
      <span style={{ marginLeft: "4px", fontSize: "12px" }}>{triggerKeyCombo}</span>
    </button>
  );
}

export function CustomToolbar({ onSave }) {
  const [editor] = useLexicalComposerContext();
  const editable = useMemo(() => editor.isEditable(), [editor]);
  const [triggerKeyCombo, setTriggerKeyCombo] = useState("\\");
  const [isDialogOpenTriggerKey, setIsDialogOpenTriggerKey] = useState(false);
  const [formats, setFormats] = useState(() => [""])

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
    <>
      <TriggerKeyDialog
        isOpen={isDialogOpenTriggerKey}
        onClose={closeDialog}
        currentTrigger={triggerKeyCombo}
        onTriggerChange={setTriggerKeyCombo}
      />

      {editable ? (
        <Stack>
          <ToggleButtonGroup
            value={formats}
            onChange={handleFormat}
            aria-label="text formatting"
            sx={{ marginb: 2 }}
          >
            <FindReplacePlugin>

              <IconButton>
                <UndoButton title="undo">
                  <UndoIcon />
                </UndoButton>
              </IconButton>

              <IconButton >
                <RedoButton title="redo">
                  <RedoIcon />
                </RedoButton>
              </IconButton>
              <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

              <IconButton>
                <SaveButton onSave={onSave} title="save">
                  <SaveIcon />
                </SaveButton>
              </IconButton>
              <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

              {/* <ButtonExpandNotes defaultState={false} /> */}
              <IconButton>
                <TriggerKeyButton
                  triggerKeyCombo={triggerKeyCombo}
                  onClick={openDialog}
                />
              </IconButton>

              <IconButton>
                <SearchButton />
              </IconButton>
              <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

              <ToggleButton value={"block_view"} sx={{border:0}}>
                <ViewButton title="toggle block view">
                  <ViewStreamIcon />
                </ViewButton>
              </ToggleButton>

              <ToggleButton value={"toggle_markup"} sx={{border:0}}>
                <FormatButton title="toggle markup">
                  <FormatTextdirectionRToLIcon />
                </FormatButton>
              </ToggleButton>

                <CustomMarkersToolbar customMarkers={markerGroups} />
              {/* The FindReplaceDialog is also a child of FindReplacePlugin */}
              <FindReplaceDialog />
              <ScripturalNodesMenuPlugin trigger={triggerKeyCombo} />
            </FindReplacePlugin>
          </ToggleButtonGroup>
        </Stack >

      ) : null
      }
    </>
  );
}