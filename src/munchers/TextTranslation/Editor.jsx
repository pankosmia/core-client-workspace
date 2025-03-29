import { useMemo } from "react";

import {
  ScripturalEditorComposer,
  HistoryPlugin,
  CursorHandlerPlugin,
  ScripturalNodesMenuPlugin,
  DEFAULT_SCRIPTURAL_BASE_SETTINGS,
  useBaseSettings
} from "@scriptural/react";
import "@scriptural/react/styles/scriptural-editor.css";
import "@scriptural/react/styles/nodes-menu.css";

import "./editor.css";
import { CustomToolbar } from "./CustomToolbar";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

function onError(error) {
  console.error(error);
}

export default function Editor({
  usj,
  initialState,
  bookCode,
  editable = true,
  children,
  onSave,
  onHistoryChange,
}) {
  const initialConfig = useMemo(() => {
    return {
      bookCode,
      usj,
      onError,
      editable,
      initialLexicalState: initialState,
      initialSettings: {
        ...DEFAULT_SCRIPTURAL_BASE_SETTINGS,
        onSave,
      },
    };
  }, [usj, editable, onSave, bookCode, initialState]);

  return (
    <div className="editor-wrapper prose">
      <ScripturalEditorComposer initialConfig={initialConfig}>
        <EditorPlugins onSave={onSave} onHistoryChange={onHistoryChange} />
        {children}
      </ScripturalEditorComposer>
    </div>
  );
}

function EditorPlugins({
  onSave,
  onHistoryChange,
}) {
  const { enhancedCursorPosition, contextMenuTriggerKey } = useBaseSettings();
  const [editor] = useLexicalComposerContext();
  const editable = useMemo(() => editor.isEditable(), [editor]);
  return (
    <>
      <CustomToolbar onSave={onSave} />
      {editable && (
        <>
          {enhancedCursorPosition && (
            <CursorHandlerPlugin
              updateTags={["history-merge", "skip-toggle-nodes"]}
              canContainPlaceHolder={(node) => node.getType() !== "graft"}
            />
          )}
          <ScripturalNodesMenuPlugin trigger={contextMenuTriggerKey} />
          <HistoryPlugin onChange={onHistoryChange} />
        </>
      )}
    </>
  );
}