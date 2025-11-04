import { useEffect, useState, useContext } from "react";
import "./TextTranslationEditorMuncher.css";
import {
    bcvContext as BcvContext,
    debugContext as DebugContext,
    getJson,
    postJson,
    i18nContext as I18nContext,
    doI18n, getText
} from "pithekos-lib";
import md5sum from 'md5';
import { enqueueSnackbar } from "notistack";

import SharedEditor from "./SharedEditor";
import { useAppReferenceHandler } from "./useAppReferenceHandler";
import { Box, Typography } from "@mui/material";
import md5 from "md5";
import { Proskomma } from "proskomma-core";
import defaultUsj from "./plugins/defaultUsj.json"
function SharedEditorWrapper({ metadata, modified, setModified, editorMode, setEditor }) {
    const { bcvRef } = useContext(BcvContext);
    const { debugRef } = useContext(DebugContext);
    const { i18nRef } = useContext(I18nContext);
    const [usj, setUsj] = useState(defaultUsj);
    const [savedChecksum, setSavedChecksum] = useState(null);
    const [bookCode, setBookCode] = useState(
        (bcvRef.current && bcvRef.current.bookCode) ||
        "TIT"
    )

    // Fetch new USFM, convert to USJ, put in incoming
    useEffect(
        () => {
            if (bookCode !== bcvRef.current.bookCode) {
                setUsj(defaultUsj);
            }
            if (usj || bookCode !== bcvRef.current.bookCode) { // Changes arrive via context after POSTing new BCV from BcvPicker
                const usfmLink = `/burrito/ingredient/raw/${metadata.local_path}?ipath=${bcvRef.current.bookCode}.usfm`;
                getText(usfmLink, debugRef.current)
                    .then(
                        res => {
                            if (res.ok) {
                                const usfm = res.text;
                                try {
                                    const pk = new Proskomma();
                                    pk.importDocument({ "lang": "eng", "abbr": "xyz" }, "usfm", usfm);
                                    const query = "{documents {usj}}";
                                    const result = pk.gqlQuerySync(query);
                                    const usj = JSON.parse(result.data.documents[0].usj);
                                    setUsj(usj);
                                    setBookCode(bcvRef.current.bookCode);
                                } catch (err) {
                                    enqueueSnackbar(
                                        `${doI18n("pages:core-local-workspace:parse_error", i18nRef.current)}: ${res.status}`,
                                        { variant: "error" }
                                    );
                                }
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
        let usfm;
        try {
            const pk = new Proskomma();
            pk.importDocument({ "lang": "eng", "abbr": "xyz" }, "usj", jsonString);
            const query = "{documents {usfm}}";
            const result = pk.gqlQuerySync(query);
            usfm = result.data.documents[0].usfm;
        } catch (err) {
            enqueueSnackbar(
                `${doI18n("pages:core-local-workspace:usfm_conversion_error", i18nRef.current)}: ${err}`,
                { variant: "error" }
            );
        }
        const response = await postJson(
            `/burrito/ingredient/raw/${repoPath}?ipath=${ingredientPath}`,
            JSON.stringify({ payload: usfm }),
            debugBool
        );
        if (response.ok) {
            enqueueSnackbar(
                `${doI18n("pages:core-local-workspace:saved", i18nRef.current)}`,
                { variant: "success" }
            );
            setModified(false);
            return response.json;
        } else {
            enqueueSnackbar(
                `${doI18n("pages:core-local-workspace:save_error", i18nRef.current)}: ${response.status}`,
                { variant: "error" }
            );
        }
    }

    const onSave = (usj) => {
        if (usj.content.length > 0) {
            uploadJsonIngredient(metadata.local_path, bcvRef.current.bookCode + ".usfm", usj, debugRef.current).then();
            setSavedChecksum(null);
            setModified(false);
        }
    }

    const onHistoryChange = ({ editorState }) => {

        /**
         * editorState is a LexicalEditorState object.
         * It has a toJSON() method that returns a JSON object.
         * This JSON object can be used to recover the editorState and save it to the browser local storage.
         */
        const recoverableState = editorState.toJSON();
        const newStateChecksum = md5(JSON.stringify(recoverableState, null, 2));
        debugRef && debugRef.current && console.log(savedChecksum, newStateChecksum);
        const notSame = newStateChecksum !== savedChecksum;
        if (notSame) {
            setSavedChecksum(newStateChecksum);
            const notSaved = notSame && !(savedChecksum === null);
            if (notSaved !== modified) {
                setModified(notSaved);
            }
        }

        debugRef && debugRef.current && console.log("onHistoryChange", recoverableState);
    }

    const { referenceHandler } = useAppReferenceHandler();

    return (
        <Box sx={{ p: 2 }}>
            <Box>
                {<SharedEditor key={md5sum(JSON.stringify(usj))}
                    modified={modified}
                    setModified={setModified}
                    editorMode={editorMode}
                    setEditor={setEditor}
                    usj={usj}
                    editable={true}
                    bookCode={bcvRef.current && bcvRef.current.bookCode}
                    onSave={onSave}
                    onHistoryChange={onHistoryChange}
                    scriptureReferenceHandler={referenceHandler}
                    referenceHandlerSource="text-translation-editor" mode="SharedEditor" />
                }
            </Box>
        </Box>
    );
}
export default SharedEditorWrapper;