import {useEffect, useState, useContext} from "react";
import "./TextTranslationViewerMuncher.css";
import TextDir from '../helpers/TextDir';
import {Proskomma} from 'proskomma-core';
import usfm2draftJson from "../../components/usfm2draftJson";
import filterByChapter from "../../components/filterByChapter";
import ViewableBible from "./SimplifiedEditor/components/ViewableBible";

import {getText, debugContext, bcvContext} from "pithekos-lib";

function TextTranslationViewerMuncher({metadata, adjSelectedFontClass}) {
    const {systemBcv} = useContext(bcvContext);
    const {debugRef} = useContext(debugContext);
    const [bookData, setBookData] = useState([]);
    const [textDir, setTextDir] = useState(metadata.script_direction.toLowerCase());

    const sbScriptDir = metadata.script_direction.toLowerCase();
    const sbScriptDirSet = sbScriptDir === 'ltr' || sbScriptDir === 'rtl';


    useEffect(
        () => {
            const getUsfm = async () => {
                let usfmResponse = await getText(`/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.usfm`,
                    debugRef.current
                );
                if (usfmResponse.ok) {
                    setBookData(filterByChapter(usfm2draftJson(usfmResponse.text), systemBcv.chapterNum));
                } else {
                    console.error("usfmResponse failed");
                }
            };
            getUsfm().then();
        },
        [debugRef, systemBcv.bookCode, systemBcv.chapterNum, systemBcv.verseNum, metadata.local_path, sbScriptDirSet, textDir]
    );

    const renderItem = item => {
        if (item.type === "token") {
            return item.payload;
        } else if (item.type === "scope" && item.subType === "start" && item.payload.startsWith("verses/")) {
            return <b style={{fontSize: "smaller", paddingRight: "0.25em"}}>{item.payload.split("/")[1]}</b>
        } else {
            return ""
        }
    }

   /*  console.log("ELIAS DEBUG: bookUsfm",bookData); */

    /* // If SB does not specify direction then it is set here, otherwise it has already been set per SB in WorkspaceCard
    return <pre>{JSON.stringify(bookData, null, 2)}{/* <div className={adjSelectedFontClass} dir={!sbScriptDirSet ? textDir : undefined}>
        {
            verseText.length > 0 ?
                verseText.map(b => <p style={{marginBottom: "1em",padding:"1rem"}}>{b.items.map(i => renderItem(i))}</p>) :
                <p style={{marginBottom: "1em",padding:"1rem"}}>No text found</p>
        }
    </div> }*/
    //</pre> */
    return (
        Object.keys(bookData).length > 0 && 
        <ViewableBible
            chapterJson={bookData}
        />
    )
}
export default TextTranslationViewerMuncher;
