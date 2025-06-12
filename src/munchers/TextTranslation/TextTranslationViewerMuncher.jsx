import {useEffect, useState, useContext} from "react";
import "./TextTranslationEditorMuncher.css";
import {Proskomma} from 'proskomma-core';

import {getText, debugContext, bcvContext} from "pithekos-lib";

function TextTranslationViewerMuncher({metadata, adjSelectedFontClass}) {
    const {systemBcv} = useContext(bcvContext);
    const {debugRef} = useContext(debugContext);
    const [verseText, setVerseText] = useState([]);

    useEffect(
        () => {
            const getVerseText = async () => {
                let usfmResponse = await getText(`/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.usfm`,
                    debugRef.current
                );
                if (usfmResponse.ok) {
                    const pk = new Proskomma();
                    pk.importDocument({
                            lang: "xxx",
                            abbr: "yyy"
                        },
                        "usfm",
                        usfmResponse.text
                    );
                    const query = `{docSets { documents { mainSequence { blocks(withScriptureCV: "${systemBcv.chapterNum}:${systemBcv.verseNum}") {text items {type subType payload}}}}}}`;
                    const result = pk.gqlQuerySync(query);
                    setVerseText(result.data.docSets[0].documents[0].mainSequence.blocks);
                } else {
                    setVerseText([]);
                }
            };
            getVerseText().then();
        },
        [debugRef, systemBcv.bookCode, systemBcv.chapterNum, systemBcv.verseNum, metadata.local_path]
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

    return <div className={adjSelectedFontClass}>
        {
            verseText.length > 0 ?
                verseText.map(b => <p style={{marginBottom: "1em"}}>{b.items.map(i => renderItem(i))}</p>) :
                <p>No text found</p>
        }
    </div>
}
export default TextTranslationViewerMuncher;
