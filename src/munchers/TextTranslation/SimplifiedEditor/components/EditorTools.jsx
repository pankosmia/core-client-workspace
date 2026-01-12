import {Box, Grid2, IconButton} from "@mui/material";
import ChapterPicker from "./ChapterPicker";
import SaveButton from "./SaveButton";
import BookPicker from "./BookPicker";
import PreviewText from "./PreviewText";
import VisibilityIcon from '@mui/icons-material/Visibility';
import md5sum from "md5";
import SettingsIcon from '@mui/icons-material/Settings';
import {useContext, useEffect, useState} from "react";
import {bcvContext as BcvContext, debugContext as DebugContext, getText} from "pithekos-lib";
import usfm2draftJson from "../../../../components/usfm2draftJson";
import {useNavigate} from "react-router-dom";

function EditorTools(
    {
        metadata,
        modified,
        setModified,
        md5sumScriptureJson,
        setMd5sumScriptureJson,
        scriptureJson,
        currentBookCode,
        setCurrentBookCode,
        locationState
    }
) {

    const {systemBcv} = useContext(BcvContext);
    const {debugRef} = useContext(DebugContext);

    const [openModalPreviewText, setOpenModalPreviewText] = useState(false);
    const [chapterNumbers, setChapterNumbers] = useState([]);

    const navigate = useNavigate();

    // Set up chapter numbers when changing book

    const allChapterNumbers = (usfmJson) => {
        let chapters = []
        for (const block of usfmJson.blocks) {
            if (block.type === "chapter") {
                chapters.push(block.chapter)
            }
        }
        return chapters
    }
    useEffect(() => {
        if (systemBcv.bookCode !== currentBookCode) {
            const doChapterNumbers = async () => {
                let usfmResponse = await getText(`/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.usfm`,
                    debugRef.current
                );
                if (usfmResponse.ok) {
                    const usfmDraftJson = usfm2draftJson(usfmResponse.text)
                    const newChapterNumbers = allChapterNumbers(usfmDraftJson)
                    setCurrentBookCode(systemBcv.bookCode)
                    setChapterNumbers(newChapterNumbers)
                }
            }
            doChapterNumbers().then();
        }
    }, [systemBcv.bookCode, metadata, currentBookCode, setCurrentBookCode, debugRef])

    return <Box
        sx={{
            position: "fixed",
            top: "40px",
            left: 0,
            right: 0,
            display: "flex",
            padding: 2,
        }}
    >
        <Grid2
            container
            alignItems="center"
            justifyContent="space-between"
            width="100%"
        >
            <Grid2 display="flex" gap={1}>
                <SaveButton
                    metadata={metadata}
                    systemBcv={systemBcv}
                    modified={modified}
                    setModified={setModified}
                    md5sumScriptureJson={md5sumScriptureJson}
                    setMd5sumScriptureJson={setMd5sumScriptureJson}
                    scriptureJson={scriptureJson}
                />
                <IconButton onClick={() => {
                    setOpenModalPreviewText(true);
                }}>
                    <VisibilityIcon/>
                </IconButton>
                <PreviewText metadata={metadata} systemBcv={systemBcv} open={openModalPreviewText}
                             setOpenModalPreviewText={setOpenModalPreviewText}/>
            </Grid2>

            <Grid2 display="flex" gap={1}>
                <BookPicker/>
                <ChapterPicker
                    chapterNumbers={chapterNumbers}
                    repoMetadata={metadata}
                />
            </Grid2>
            <Grid2 display="flex" gap={1}>
                <IconButton
                    disabled={md5sum(JSON.stringify(scriptureJson)) !== md5sumScriptureJson}
                    onClick={() =>
                        navigate(
                            {
                                pathname: "/",
                                search: "return-page=workspace"
                            },
                            {state: locationState}
                        )
                    }
                >
                    <SettingsIcon/>
                </IconButton>
            </Grid2>
        </Grid2>
    </Box>
}

export default EditorTools;