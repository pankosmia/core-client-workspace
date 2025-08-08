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
import { Divider } from "@mui/material";

function SearchButton() {
  const { isVisible, setIsVisible } = useFindReplace();

  return (
    <button
      onClick={() => setIsVisible(!isVisible)}
      title="find and replace"
      className="toolbar-button"
    >
      <MdSearch size={18} />
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
      <MdKeyboardCommandKey size={18} />
      <span style={{ marginLeft: "4px", fontSize: "12px" }}>{triggerKeyCombo}</span>
    </button>
  );
}


export function CustomToolbar({ onSave }) {
  const [editor] = useLexicalComposerContext();
  const editable = useMemo(() => editor.isEditable(), [editor]);

  const [triggerKeyCombo, setTriggerKeyCombo] = useState("\\");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Define the markers to show in the toolbar
  const markerGroups = {
    ChapterVerse: ["c", "v"],
    Prose: ["p", "m"],
    Poetry: ["q1", "q2"],
    Headings: ["mt", "s", "s2", "s3"],
  };

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <TriggerKeyDialog
        isOpen={isDialogOpen}
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
                  <MdOutlineUndo size={20} />
                </UndoButton>
                <RedoButton title="redo">
                  <MdOutlineRedo size={20} />
                </RedoButton>
                <hr />
                <Divider orientation="vertical" variant="middle" flexItem />
                <SaveButton onSave={onSave} title="save">
                  <MdSave size={20} />
                </SaveButton>
                <Divider orientation="vertical" variant="middle" flexItem />
                <hr />
                <ViewButton title="toggle block view">
                  <MdViewAgenda size={16} />
                </ViewButton>
                <FormatButton title="toggle markup">
                  <ImPilcrow />
                </FormatButton>
                 <Divider orientation="vertical" variant="middle" flexItem />
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