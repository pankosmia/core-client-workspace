import { useMemo, useState } from "react";
import { FindReplaceDialog } from "./FindReplaceDialog";

import {
  FindReplacePlugin,
  FormatButton,
  RedoButton,
  SaveButton,
  ScripturalNodesMenuPlugin,
  ToolbarContainer,
  ToolbarSection,
  UndoButton,
  useFindReplace,
  ViewButton,
} from "@scriptural/react";

import { ImPilcrow } from "react-icons/im";
import {
  MdOutlineUndo,
  MdOutlineRedo,
  MdSave,
  MdViewAgenda,
  MdKeyboardCommandKey,
  MdSearch,
} from "react-icons/md";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ButtonExpandNotes } from "./plugins/ButtonExpandNotes";
import CustomMarkersToolbar from "./plugins/CustomMarkersToolbar";
import { TriggerKeyDialog } from "./TriggerKeyDialog";
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardCommandKeyIcon from '@mui/icons-material/KeyboardCommandKey';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import FormatTextdirectionRToLIcon from '@mui/icons-material/FormatTextdirectionRToL';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';

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
          <div className="flex flex-col">
            <ToolbarContainer>
              <ToolbarSection className="w-full">
                <UndoButton title="undo">
                  <UndoIcon size={20} />
                </UndoButton>
                <RedoButton title="redo">
                  <RedoIcon size={20} />
                </RedoButton>
                <hr />
                <SaveButton onSave={onSave} title="save">
                  <SaveIcon size={20} />
                </SaveButton>
                <hr />
                <ViewButton title="toggle block view">
                  <ViewStreamIcon size={16} />
                </ViewButton>
                <FormatButton title="toggle markup">
                  <FormatTextdirectionRToLIcon />
                </FormatButton>

                <ButtonExpandNotes defaultState={false} />
                <hr />
                <TriggerKeyButton
                  triggerKeyCombo={triggerKeyCombo}
                  onClick={openDialog}
                  className="ml-auto"
                />
                <SearchButton />
              </ToolbarSection>

              <CustomMarkersToolbar customMarkers={markerGroups} />
            </ToolbarContainer>
          </div>
          {/* The FindReplaceDialog is also a child of FindReplacePlugin */}
          <FindReplaceDialog />
          <ScripturalNodesMenuPlugin trigger={triggerKeyCombo} />
        </FindReplacePlugin>
      ) : null}
    </>
  );
}