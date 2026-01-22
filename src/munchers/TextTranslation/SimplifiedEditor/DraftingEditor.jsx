import {useEffect, useContext, useState} from "react";
import {
    bcvContext as BcvContext,
    debugContext as DebugContext,
    getText
} from "pithekos-lib";
import {Box, Typography} from "@mui/material";
import usfm2draftJson from '../../../components/usfm2draftJson';
import EditableBible from "./components/EditableBible";
import md5sum from "md5";
import EditorTools from "./components/EditorTools";
import TextDir from '../../helpers/TextDir';
import ExtractJsonValues from "../../helpers/ExtractJsonValues";

function DraftingEditor(
    {
        metadata,
        modified,
        setModified,
        locationState
    }
) {
    const {systemBcv} = useContext(BcvContext);
    const {debugRef} = useContext(DebugContext);
    const [scriptureJson, setScriptureJson] = useState({headers: {}, blocks: []});
    const [chapterJson, setChapterJson] = useState(null);
    const [md5sumScriptureJson, setMd5sumScriptureJson] = useState([]);
    const [currentBookCode, setCurrentBookCode] = useState("zzz");
    const [bookChangeCount, setBookChangeCount] = useState(0);
    const [textDir, setTextDir] = useState(metadata.script_direction.toLowerCase());

    const sbScriptDir = metadata.script_direction.toLowerCase();
    const sbScriptDirSet = sbScriptDir === 'ltr' || sbScriptDir === 'rtl';

    // Set up 'are you sure you want to leave page' for Electron
    useEffect(() => {
        const isElectron = !!window.electronAPI;
        if (isElectron) {
            window.electronAPI.setCanClose(!modified);
        }
    }, [modified]);

    // Get whole book content
    useEffect(() => {
        if (systemBcv.bookCode !== currentBookCode) {
            const doScriptureJson = async () => {
                let usfmResponse = await getText(`/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.usfm`,
                    debugRef.current
                );
                if (usfmResponse.ok) {
                    const usfmDraftJson = usfm2draftJson(usfmResponse.text);
                    setScriptureJson(
                        usfmDraftJson
                    )
                    const hash = md5sum(JSON.stringify(usfmDraftJson));
                    setMd5sumScriptureJson(hash);
                    if (!sbScriptDirSet) {
                        const dir = await TextDir(usfmResponse.text, 'usfm');
                        setTextDir(dir);
                    }
                }
            }
            doScriptureJson().then();
        }

    }, [debugRef, systemBcv.bookCode, metadata, currentBookCode, sbScriptDirSet]);

    // Make chapter content from whole book content
    const filterByChapter = (usfmJson, requiredChapter) => {
        let chapterBlocks = [];
        let currentChapter = 0;
        let blockN = 0;
        for (const block of usfmJson.blocks) {
            if (block.type === "chapter") {
                currentChapter = block.chapter
            }
            if (currentChapter === requiredChapter) {
                chapterBlocks.push({...block, position: blockN})
            }
            blockN += 1
        }
        return {
            headers: usfmJson.headers,
            blocks: chapterBlocks
        }
    }

    useEffect(
        () => {
            if (scriptureJson) {
                setChapterJson(filterByChapter(scriptureJson, systemBcv.chapterNum));
                setBookChangeCount(bookChangeCount + 1);
            }
        },
        [scriptureJson, systemBcv.bookCode, systemBcv.chapterNum]
    );

useEffect(() => {
  const contentText = ExtractJsonValues(scriptureJson, ['content']).toString().replace(/,/g, "");
  const dir = TextDir(contentText, 'text');
  if (textDir !== dir) {
    setTextDir(dir);
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [scriptureJson])

    return <>
        <EditorTools
            metadata={metadata}
            modified={modified}
            setModified={setModified}
            md5sumScriptureJson={md5sumScriptureJson}
            setMd5sumScriptureJson={setMd5sumScriptureJson}
            scriptureJson={scriptureJson}
            currentBookCode={currentBookCode}
            setCurrentBookCode={setCurrentBookCode}
        />
        {/** If SB does not specify direction then it is set here, otherwise it has already been set per SB in WorkspaceCard */}
        <Box dir={!sbScriptDirSet ? textDir : undefined}>
            {
                chapterJson ? <EditableBible
                        chapterJson={chapterJson}
                        scriptureJson={scriptureJson}
                        setScriptureJson={setScriptureJson}
                        key={bookChangeCount}
                    /> :
                    <Typography> loading ...</Typography>
            }
        </Box>
    </>;
}

export default DraftingEditor;
