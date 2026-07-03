import { useEffect, useState, useContext } from "react";
import usfm2draftJson from "../../components/usfm2draftJson";
import filterByChapter from "../../components/filterByChapter";
import ViewableBible from "./SimplifiedEditor/components/ViewableBible";

import {
  getText,
  getJson /* For testing Context only */,
} from "pankosmia-lib/http";
import { debugContext, bcvContext } from "pankosmia-rcl";
import "./TextTranslationViewerMuncher.css";
import TextDir from "../helpers/TextDir";

function TextTranslationViewerMuncher({ metadata }) {
  const { systemBcv } = useContext(bcvContext);
  const { debugRef } = useContext(debugContext);
  const [bookData, setBookData] = useState(null);
  const [textDir, setTextDir] = useState(
    metadata?.script_direction
      ? metadata.script_direction.toLowerCase()
      : undefined,
  );

  const sbScriptDir = metadata?.script_direction
    ? metadata.script_direction.toLowerCase()
    : undefined;
  const sbScriptDirSet = sbScriptDir === "ltr" || sbScriptDir === "rtl";

  const [word, setWord] = useState(null);

  useEffect(() => {
    const getUsfm = async () => {
      let usfmResponse = await getText(
        `/api/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.usfm`,
        debugRef.current,
      );
      if (usfmResponse.ok) {
        setBookData(usfm2draftJson(usfmResponse.text));
        if (!sbScriptDirSet) {
          const dir = await TextDir(usfmResponse.text, "usfm");
          setTextDir(dir);
        }
        //console.log(usfmResponse.text);
      } else {
        console.error("usfmResponse failed");
      }
    };
    getUsfm();
  }, [debugRef, systemBcv.bookCode, metadata.local_path, sbScriptDirSet]);

  const chapterData = bookData
    ? filterByChapter(bookData, systemBcv.chapterNum)
    : [];

  /* For testing Context only */
  useEffect(() => {
    const fetchAlignment = async () => {
      const response = await getJson(
        "/api/app-state/alignment",
        debugRef.current,
      );
      if (response.ok) setWord(response.json.word);
    };

    fetchAlignment();

    const evtSource = new EventSource("/api/notifications");
    evtSource.addEventListener("alignment", () => fetchAlignment());

    return () => evtSource.close();
  }, []);

  //console.log('sbScriptDirSet: ' + !sbScriptDirSet.toString())
  //console.log('textDir: ' + textDir)

  // If SB does not specify direction then it is set here, otherwise it has already been set per SB in WorkspaceCard
  return (
    Object.keys(chapterData).length > 0 && (
      <ViewableBible
        chapterJson={chapterData}
        dir={!sbScriptDirSet ? textDir : undefined}
        word={word}
      />
    )
  );
}
export default TextTranslationViewerMuncher;
