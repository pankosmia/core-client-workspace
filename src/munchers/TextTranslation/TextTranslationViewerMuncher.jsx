import {useEffect, useState, useContext} from "react";
import "./TextTranslationViewerMuncher.css";
import TextDir from '../helpers/TextDir';
import {Proskomma} from 'proskomma-core';

import {getText, debugContext, bcvContext} from "pithekos-lib";

function TextTranslationViewerMuncher({metadata, adjSelectedFontClass}) {
    const {systemBcv} = useContext(bcvContext);
    const {debugRef} = useContext(debugContext);
    const [verseText, setVerseText] = useState([]);
    const [textDir, setTextDir] = useState(metadata.script_direction.toLowerCase());

    const sbScriptDir = metadata.script_direction.toLowerCase();
    const sbScriptDirSet = sbScriptDir === 'ltr' || sbScriptDir === 'rtl';


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
                    !sbScriptDirSet && await setTextDir(TextDir(usfmResponse.text, 'usfm'));
                    const query = `{docSets { documents { mainSequence { blocks(withScriptureCV: "${systemBcv.chapterNum}:${systemBcv.verseNum}") {text items {type subType payload}}}}}}`;
                    const result = pk.gqlQuerySync(query);
                    setVerseText(result.data.docSets[0].documents[0].mainSequence.blocks);
                } else {
                    setVerseText([]);
                }
            };
            getVerseText().then();
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

    // If SB does not specify direction then it is set here, otherwise it has already been set per SB in WorkspaceCard
    return <div className={adjSelectedFontClass} dir={!sbScriptDirSet ? textDir : undefined}>
        {
            verseText.length > 0 ?
                verseText.map(b => <p style={{marginBottom: "1em",padding:"1rem"}}>{b.items.map(i => renderItem(i))}</p>) :
                <p style={{marginBottom: "1em",padding:"1rem"}}>No text found</p>
        }
    </div>
}
export default TextTranslationViewerMuncher;
