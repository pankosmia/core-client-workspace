import "./TextTranslationEditorMuncher.css";
import {
    Box,
} from "@mui/material";
import DraftingEditor from "./SimplifiedEditor/DraftingEditor";
import {useState} from "react";

function TextTranslationEditorMuncher({metadata, locationState}) {
    const [modified, setModified] = useState(false);

    return (
        <Box sx={{p: 2}}>
            <DraftingEditor
                metadata={metadata}
                modified={modified}
                setModified={setModified}
                locationState={locationState}
            />
        </Box>

    );
}

export default TextTranslationEditorMuncher;