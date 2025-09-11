import {useMemo, useState} from "react";

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

function onError(error) {
    console.error(error);
}

export default function SharedEditor(
    {
        modified,
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
    }
) {
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
            <ScripturalEditorComposer initialConfig={initialConfig}
                                      scriptureReferenceHandler={scriptureReferenceHandler}>
                <EditorPlugins
                    modified={modified}
                    onSave={onSave} onHistoryChange={onHistoryChange}
                    enableScrollToReference={enableScrollToReference}/>
                {children}
            </ScripturalEditorComposer>
        </div>
    );
}

function EditorPlugins(
    {
        modified,
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
                <CustomToolbar onSave={onSave} modified={modified}/>
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