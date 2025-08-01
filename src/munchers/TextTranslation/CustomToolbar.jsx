import { useContext, useMemo, useState } from "react";
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
import {
    i18nContext as I18nContext,
    doI18n,
} from "pithekos-lib";

function SearchButton() {
  const { isVisible, setIsVisible } = useFindReplace();
  const { i18nRef } = useContext(I18nContext);

  return (
    <button
      onClick={() => setIsVisible(!isVisible)}
      title={doI18n("pages:core-local-workspace:search_tool", i18nRef.current)}
      className="toolbar-button"
    >
      <SearchIcon/>
    </button>
  );
}

function TriggerKeyButton({triggerKeyCombo,onClick, className,}) {
  const { i18nRef } = useContext(I18nContext); 
  
  return (
    <button
      className={"toolbar-button " + (className ? className : "")}
      onClick={onClick}

      title={doI18n("pages:core-local-workspace:key_combination", i18nRef.current)}
    >
      <KeyboardCommandKeyIcon/>
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
 const { i18nRef } = useContext(I18nContext);

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
       
            <FindReplacePlugin>
          <ToggleButtonGroup
            value={formats}
            onChange={handleFormat}
            aria-label="text formatting"
            sx={{border:"1px solid"}}
          >
              <IconButton>
                <UndoButton title={doI18n("pages:core-local-workspace:undo", i18nRef.current)}>
                  <UndoIcon />
                </UndoButton>
              </IconButton>

              <IconButton >
                <RedoButton title={doI18n("pages:core-local-workspace:redo", i18nRef.current)}>
                  <RedoIcon />
                </RedoButton>
              </IconButton>
              <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

              <IconButton>
                <SaveButton onSave={onSave} title={doI18n("pages:core-local-workspace:add", i18nRef.current)}>
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
                <ViewButton  title={doI18n("pages:core-local-workspace:toggle_block_view", i18nRef.current)}>
                  <ViewStreamIcon />
                </ViewButton>
              </ToggleButton>

              <ToggleButton value={"toggle_markup"} sx={{border:0}}>
                <FormatButton title={doI18n("pages:core-local-workspace:toggle_markup", i18nRef.current)}>
                  <FormatTextdirectionRToLIcon />
                </FormatButton>
              </ToggleButton>

          </ToggleButtonGroup>

                <CustomMarkersToolbar customMarkers={markerGroups} doI18n={doI18n} i18nRef={i18nRef} />

              {/* The FindReplaceDialog is also a child of FindReplacePlugin */}
              <FindReplaceDialog />
              <ScripturalNodesMenuPlugin trigger={triggerKeyCombo} />
            </FindReplacePlugin>

      ) : null
      }
    </>
  );
}