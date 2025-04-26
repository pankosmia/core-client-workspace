import {useEffect, useState, useContext} from "react";
import "./TextTranslationEditorMuncher.css";
import {
    bcvContext as BcvContext,
    debugContext as DebugContext,
    getJson,
    postJson,
    i18nContext as I18nContext,
    doI18n
} from "pithekos-lib";
import {enqueueSnackbar} from "notistack";

import Editor from "./Editor";
import {useAppReferenceHandler} from "./useAppReferenceHandler";

function TextTranslationEditorMuncher({metadata, selectedFontClass}) {
    const {bcvRef} = useContext(BcvContext);
    const {debugRef} = useContext(DebugContext);
    const {i18nRef} = useContext(I18nContext);
    const [state, setState] = useState({
        usj: {
            working: null,
            incoming: null,
        },
        navigation: {
            bookCode: null,
            chapterNum: null,
            verseNum: null,
        },
        rerenderNeeded: false,
        rendered: null,
        selectedPath: null,
        firstBodyPara: null
    });

    const uploadJsonIngredient = async (repoPath, ingredientPath, jsonData, debugBool) => {
        // Convert JSON object to a file
        const jsonString = JSON.stringify(jsonData, null, 2);

        const response = await postJson(
            `/burrito/ingredient/as-usj/${repoPath}?ipath=${ingredientPath}`,
            jsonString,
            debugBool
        );

        if (response.ok) {
            enqueueSnackbar(
                `${doI18n("pages:core-local-workspace:saved", i18nRef.current)}`,
                {variant: "success"}
            );
            return response.json;
        } else {
            enqueueSnackbar(
                `${doI18n("pages:core-local-workspace:save_error", i18nRef.current)}: ${response.status}`,
                {variant: "error"}
            );
            throw new Error(`Failed to save: ${response.status}, ${response.error}`);
        }
    }

    // Fetch new USFM as USJ, put in incoming
    useEffect(
        () => {
            if (
                (!state.usj.working && !state.usj.incoming) ||
                state.navigation.bookCode !== bcvRef.current.bookCode ||
                state.navigation.chapterNum !== bcvRef.current.chapterNum
            ) {
                console.log("useEffect", "Fetch new USFM", state.usj.working, bcvRef.current);
                const usfmLink = `/burrito/ingredient/as-usj/${metadata.local_path}?ipath=${bcvRef.current.bookCode}.usfm`;
                getJson(usfmLink, debugRef.current)
                    .then(
                        res => {
                            if (res.ok) {
                                setState(
                                    {
                                        ...state,
                                        usj: {
                                            ...state.usj,
                                            incoming: res.json
                                        },
                                        navigation: {
                                            bookCode: bcvRef.current.bookCode,
                                            chapterNum: bcvRef.current.chapterNum,
                                            verseNum: bcvRef.current.verseNum
                                        }
                                    }
                                );
                            } else {
                                console.log(`TextTranslation returned status ${res.status}`);
                                setState(
                                    {
                                        ...state,
                                        usj: {
                                            ...state.usj,
                                            working: null,
                                        },
                                        rerenderNeeded: false
                                    });

                            }
                        }).catch(err => console.log("TextTranslation fetch error", err));
            }
        },
        [bcvRef, state, metadata, debugRef]
    );

    // Move incoming USJ to working and increment updates
    useEffect(
        () => {
            if (state.usj.incoming) {
                console.log("useEffect", "Move USJ to working");
                setState(
                    {
                        ...state,
                        usj: {
                            ...state.usj,
                            incoming: null,
                            working: state.usj.incoming,
                        },
                        rerenderNeeded: true
                    });
            }
        },
        [state]
    );

    // Generate rendered from working
    useEffect(
        () => {
            if (state.rerenderNeeded) {
                console.log("useEffect", "rerender");
                let headers = {};
                let paras = [];
                let nPara = 0;
                let newFirstBodyPara = -1;
                let inChapter = false;
                for (const contentElement of state.usj.working.content) {
                    if (contentElement.marker === "id") {
                        headers[contentElement.marker] = `${contentElement.code} ${contentElement.content}`;
                    } else if (["h", "toc", "toc1", "toc2", "toc3"].includes(contentElement.marker)) {
                        headers[contentElement.marker] = contentElement.content;
                    } else {
                        if (contentElement.marker === "c") {
                            inChapter = (parseInt(contentElement.number) === state.navigation.chapterNum);
                        }
                        if (inChapter) {
                            if (newFirstBodyPara < 0) {
                                newFirstBodyPara = nPara;
                            }
                            paras.push(
                                {
                                    "type": contentElement.type,
                                    "content": contentElement.content || [],
                                    "number": contentElement.number || 0,
                                    "marker": contentElement.marker || "unknown",
                                    nPara,
                                    selectedPath: state.selectedPath
                                }
                            );
                        }
                    }
                    nPara++;
                }
                setState({
                    ...state,
                    rerenderNeeded: false,
                    rendered: {headers, paras},
                    firstBodyPara: newFirstBodyPara,
                    selectedPath: state.selectedPath || [newFirstBodyPara, 0]
                });
            }
        },
        [state]
    );

    const onSave = (usj) => {
        console.log("onSave", usj);
        if (usj.content.length > 0) {
            uploadJsonIngredient(metadata.local_path, bcvRef.current.bookCode + ".usfm", usj, debugRef.current);
        }
    }

    const onHistoryChange = ({editorState}) => {

        /**
         * editorState is a LexicalEditorState object.
         * It has a toJSON() method that returns a JSON object.
         * This JSON object can be used to recover the editorState and save it to the browser local storage.
         */
        const recoverableState = editorState.toJSON();
        console.log("onHistoryChange", recoverableState);
    }

    const {referenceHandler} = useAppReferenceHandler();

    return state.usj.working
        ? <Editor
            usj={state.usj.working}
            editable={true}
            bookCode={bcvRef.current.bookCode}
            onSave={onSave}
            onHistoryChange={onHistoryChange}
            scriptureReferenceHandler={referenceHandler}
            referenceHandlerSource="text-translation-editor"
        />
        : <div>Loading data...</div>;
}

export default TextTranslationEditorMuncher;
