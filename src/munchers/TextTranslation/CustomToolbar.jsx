import { useMemo } from "react";
import { FindReplaceDialog } from "./FindReplaceDialog";

import {
  ContextMenuTriggerButton,
  EnhancedCursorToggleButton,
  FindReplacePlugin,
  FormatButton,
  MarkerInfo,
  RedoButton,
  SaveButton,
  ScriptureReferenceInfo,
  ToolbarContainer,
  ToolbarSection,
  UndoButton,
  useFindReplace,
  ViewButton,
} from "@scriptural/react";

import { ImPilcrow } from "react-icons/im";
import { RiInputCursorMove } from "react-icons/ri";
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

export function CustomToolbar({ onSave }) {
  const [editor] = useLexicalComposerContext();
  const editable = useMemo(() => editor.isEditable(), [editor]);
  return (
    <ToolbarContainer>
      <ToolbarSection>
        {editable ? (
          <>
            <UndoButton title="undo">
              <MdOutlineUndo size={20} />
            </UndoButton>
            <RedoButton title="redo">
              <MdOutlineRedo size={20} />
            </RedoButton>
            <hr />
            <SaveButton onSave={onSave} title="save">
              <MdSave size={20} />
            </SaveButton>
            <hr />
            <FindReplacePlugin>
              <SearchButton />
              <FindReplaceDialog />
            </FindReplacePlugin>
          </>
        ) : null}
        <ViewButton title="toggle block view">
          <MdViewAgenda size={16} />
        </ViewButton>
        <FormatButton title="toggle markup">
          <ImPilcrow />
        </FormatButton>
        {editable && (
          <EnhancedCursorToggleButton title="toggle enhanced cursor">
            <RiInputCursorMove size={18} />
          </EnhancedCursorToggleButton>
        )}
        <ButtonExpandNotes defaultState={editable ? false : true} />
        <hr />
      </ToolbarSection>
      <ToolbarSection>
        {editable && (
          <ContextMenuTriggerButton title="set context menu trigger key">
            <MdKeyboardCommandKey size={18} />
          </ContextMenuTriggerButton>
        )}
        <MarkerInfo />
        <ScriptureReferenceInfo />
      </ToolbarSection>
    </ToolbarContainer>
  );
}