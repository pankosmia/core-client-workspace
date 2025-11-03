import "./TextTranslationEditorMuncher.css";
import {
    Box,
} from "@mui/material";
import SharedEditorWrapper from "./SharedEditorWrapper";
import DraftingEditor from "./DraftingEditor";
import { useState, useContext } from "react";
import {debugContext} from "pithekos-lib";

function TextTranslationEditorMuncher({metadata}) {
    const {debugRef} = useContext(debugContext);
    const [editor, setEditor] = useState(debugRef.current ? "chapter" : "units");
    const [modified, setModified] = useState(false);

    return (
        <Box sx={{p: 2}}>
            <Box>
                {editor === "chapter" ? (
                <SharedEditorWrapper
                    metadata={metadata}
                    modified={modified}
                    setModified={setModified}
                    editorMode={editor}
                    setEditor={setEditor}

                />
                ) : (
                <DraftingEditor
                    metadata={metadata}
                    modified={modified}
                    setModified={setModified}
                    editorMode={editor}
                    setEditor={setEditor}
                />
                )}
            </Box>
        </Box>
        
    );
}

export default TextTranslationEditorMuncher;