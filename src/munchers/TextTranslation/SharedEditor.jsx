import {useEffect, useMemo} from "react";

import { Box } from "@mui/material";
import {
    ScripturalEditorComposer,
    HistoryPlugin,
    CursorHandlerPlugin,
    DEFAULT_SCRIPTURAL_BASE_SETTINGS,
    useBaseSettings,
    ScrollToReferencePlugin,
    MarkersMenuProvider,
} from "@scriptural/react";
import "@scriptural/react/styles/scriptural-editor.css";
import "@scriptural/react/styles/nodes-menu.css";

import "./editor.css";
import {CustomToolbar} from "./CustomToolbar";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {ReferenceSyncPlugin} from "./plugins/ReferenceSyncPlugin";
import CustomEditorMode from "./CustomEditorMode";

function onError(error) {
    console.error(error);
}

export default function SharedEditor(
    {
        modified,
        setModified,
        usj,
        initialState,
        bookCode,
        editable = true,
        children,
        onSave,
        onHistoryChange,
        scriptureReferenceHandler,
        referenceHandlerSource,
        enableScrollToReference = true,
        editorMode,
        setEditor
    }
) {
    const initialConfig = useMemo(() => {
        return {
            bookCode,
            usj,
            editable,
            onError,
            initialLexicalState: initialState,
            initialSettings: {
                ...DEFAULT_SCRIPTURAL_BASE_SETTINGS,
                onSave,
            },
        };
    }, [usj, editable, onSave, bookCode, initialState]);

    useEffect(() => {
        const isElectron = !!window.electronAPI;
        if (isElectron) {
            window.electronAPI.setCanClose(!modified);
        }
    }, [modified]);

    return (
        <Box
          sx={{
              lineHeight: 'normal', // Override tailwind line-height settings to support Awami Nastaliq
          }}
          className="editor-wrapper prose"
        >
            <ScripturalEditorComposer initialConfig={initialConfig}
                                      scriptureReferenceHandler={scriptureReferenceHandler}>
                <EditorPlugins
                    modified={modified} setModified={setModified}
                    editorMode={editorMode} setEditor={setEditor}
                    onSave={onSave} onHistoryChange={onHistoryChange}
                    enableScrollToReference={enableScrollToReference}/>
                {children}
            </ScripturalEditorComposer>
        </Box>
    );
}

function EditorPlugins(
    {
        modified,
        setModified,
        editorMode,
        setEditor,
        onSave,
        onHistoryChange,
        enableScrollToReference = true,
    }
) {
    const {enhancedCursorPosition, contextMenuTriggerKey} = useBaseSettings();
    const [editor] = useLexicalComposerContext();
    const editable = useMemo(() => editor.isEditable(), [editor]);
    return (
        <>
            <MarkersMenuProvider>
                <CustomToolbar onSave={onSave} modified={modified} setModified={setModified} editorMode={editorMode} setEditor={setEditor} />
                {editable && (
                    <>
                        {enhancedCursorPosition && (
                            <CursorHandlerPlugin
                                updateTags={["history-merge", "skip-toggle-nodes"]}
                                canContainPlaceHolder={(node) => node.getType() !== "graft"}
                            />
                        )}
                        <ReferenceSyncPlugin/>
                        <HistoryPlugin onChange={onHistoryChange}/>
                    </>
                )}
                {enableScrollToReference && (
                    <ScrollToReferencePlugin scrollBehavior="smooth" scrollOffset={80}/>
                )}
            </MarkersMenuProvider>
        </>
    );
}