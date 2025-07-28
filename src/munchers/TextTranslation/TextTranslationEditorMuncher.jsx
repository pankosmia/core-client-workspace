import { useEffect, useState, useContext } from "react";
import "./TextTranslationEditorMuncher.css";
import {
    bcvContext as BcvContext,
    debugContext as DebugContext,
    getJson,
    postJson,
    i18nContext as I18nContext,
    doI18n
} from "pithekos-lib";
import md5sum from 'md5';
import { enqueueSnackbar } from "notistack";

import Editor from "./Editor";
import { useAppReferenceHandler } from "./useAppReferenceHandler";
import DraftingEditor from "./DraftingEditor";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";

function TextTranslationEditorMuncher({ metadata, adjSelectedFontClass }) {
    const { bcvRef } = useContext(BcvContext);
    const { debugRef } = useContext(DebugContext);
    const { i18nRef } = useContext(I18nContext);
    const [usj, setUsj] = useState(null);
    const [contentChanged, _setContentChanged] = useState(false);

    const [viewEditor, setViewEditor] = useState("usfm");
    const [bookCode, setBookCode] = useState(
        (bcvRef.current && bcvRef.current.bookCode) ||
        "TIT"
    )
    const setContentChanged = nv => {
        console.log("setContentChanged", nv);
        _setContentChanged(nv);
    }

    const handleSwitchPage = () => {
        setViewEditor((prev) =>
            prev === 'usfm' ? 'units' : 'usfm'
        );
    };

    // Fetch new USFM as USJ, put in incoming
    useEffect(
        () => {
            if (!usj || bookCode !== bcvRef.current.bookCode) { // Changes arrive via context after POSTing new BCV from BcvPicker
                const usfmLink = `/burrito/ingredient/as-usj/${metadata.local_path}?ipath=${bcvRef.current.bookCode}.usfm`;
                getJson(usfmLink, debugRef.current)
                    .then(
                        res => {
                            if (res.ok) {
                                setUsj(res.json);
                                setBookCode(bcvRef.current.bookCode);
                            } else {
                                enqueueSnackbar(
                                    `${doI18n("pages:core-local-workspace:load_error", i18nRef.current)}: ${res.status}`,
                                    { variant: "error" }
                                );

                            }
                        }).catch(err => console.log("TextTranslation fetch error", err));
            }
        },
        [bcvRef, bookCode, metadata, debugRef]
    );

    const uploadJsonIngredient = async (repoPath, ingredientPath, jsonData, debugBool) => {
        // Convert JSON object to a file
        const jsonString = JSON.stringify(jsonData, null, 2);
        const response = await postJson(
            `/burrito/ingredient/as-usj/${repoPath}?ipath=${ingredientPath}`,
            jsonString,
            debugBool
        );
        console.log("response", response)

        if (response.ok) {
            enqueueSnackbar(
                `${doI18n("pages:core-local-workspace:saved", i18nRef.current)}`,
                { variant: "success" }
            );
            setContentChanged(false);
            return response.json;
        } else {
            enqueueSnackbar(
                `${doI18n("pages:core-local-workspace:save_error", i18nRef.current)}: ${response.status}`,
                { variant: "error" }
            );
            throw new Error(`Failed to save: ${response.status}, ${response.error}`);
        }
    }

    const onSave = (usj) => {
        if (usj.content.length > 0) {
            uploadJsonIngredient(metadata.local_path, bcvRef.current.bookCode + ".usfm", usj, debugRef.current);
        }
    }

    const onHistoryChange = ({ editorState }) => {

        /**
         * editorState is a LexicalEditorState object.
         * It has a toJSON() method that returns a JSON object.
         * This JSON object can be used to recover the editorState and save it to the browser local storage.
         */
        const recoverableState = editorState.toJSON();
        debugRef && debugRef.current && console.log("onHistoryChange", recoverableState);
        setContentChanged(true);
    }

    useEffect(() => {
        const onBeforeUnload = ev => {
            ev.preventDefault();
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const { referenceHandler } = useAppReferenceHandler();

    return (
        <Box sx={{ p: 2 }}>
            <ToggleButtonGroup
                variant="contained"
                value={viewEditor}
                exclusive
                onClick={handleSwitchPage}
            >
                <ToggleButton value="usfm"> USFM </ToggleButton>
                <ToggleButton value="units">UNITS </ToggleButton>
            </ToggleButtonGroup>

            <Box mt={4}>
                {viewEditor === 'usfm' ? (
                    usj ? <Editor
                        key={md5sum(JSON.stringify(usj))}
                        usj={usj}
                        editable={true}
                        bookCode={bcvRef.current && bcvRef.current.bookCode}
                        onSave={onSave}
                        onHistoryChange={onHistoryChange}
                        scriptureReferenceHandler={referenceHandler}
                        referenceHandlerSource="text-translation-editor" mode="Editor" />
                        : <p>Loading data</p>
                ) : (
                    <DraftingEditor mode="units" metadata={metadata} />
                )}
            </Box>
        </Box>
    );
}
export default TextTranslationEditorMuncher;