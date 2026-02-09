import {useEffect, useState, useContext} from "react";
import usfm2draftJson from "../../components/usfm2draftJson";
import filterByChapter from "../../components/filterByChapter";
import ViewableBible from "./SimplifiedEditor/components/ViewableBible";

import { getText } from "pithekos-lib";
import { debugContext, bcvContext } from "pankosmia-rcl";
import "./TextTranslationViewerMuncher.css";
import TextDir from "../helpers/TextDir";

function TextTranslationViewerMuncher({metadata}) {
    const {systemBcv} = useContext(bcvContext);
    const {debugRef} = useContext(debugContext);
    const [chapterData, setChapterData] = useState([]);
    const [textDir, setTextDir] = useState(
      metadata?.script_direction ? metadata.script_direction.toLowerCase() : undefined
    );

  const sbScriptDir = metadata?.script_direction
    ? metadata.script_direction.toLowerCase()
    : undefined;
  const sbScriptDirSet = sbScriptDir === "ltr" || sbScriptDir === "rtl";

    useEffect(
        () => {
            const getUsfm = async () => {
                let usfmResponse = await getText(`/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.usfm`,
                    debugRef.current
                );
                if (usfmResponse.ok) {
                    setChapterData(filterByChapter(usfm2draftJson(usfmResponse.text), systemBcv.chapterNum));
                    if (!sbScriptDirSet) {
                      const dir = await TextDir(usfmResponse.text, 'usfm');
                      setTextDir(dir);
                    }
                    console.log(usfmResponse.text);
                } else {
                    console.error("usfmResponse failed");
                }
            };
            getUsfm();
        },
        [debugRef, systemBcv.bookCode, systemBcv.chapterNum, systemBcv.verseNum, metadata.local_path, sbScriptDirSet, textDir]
    );

    console.log('sbScriptDirSet: ' + !sbScriptDirSet.toString())
    console.log('textDir: ' + textDir)


    // If SB does not specify direction then it is set here, otherwise it has already been set per SB in WorkspaceCard
    return (
        Object.keys(chapterData).length > 0 &&
        <ViewableBible
            chapterJson={chapterData}
            dir={!sbScriptDirSet ? textDir : undefined}
        />
    )
}
export default TextTranslationViewerMuncher;
