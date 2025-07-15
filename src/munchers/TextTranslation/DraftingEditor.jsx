import { useEffect, useContext, useState } from "react";
import { Proskomma } from 'proskomma-core';
import {
    bcvContext as BcvContext,
    debugContext as DebugContext,
    getText,
} from "pithekos-lib";


function DraftingEditor({ metadata, adjSelectedFontClass }) {
    const { systemBcv } = useContext(BcvContext);
    const { debugRef } = useContext(DebugContext);
    const [verseText, setVerseText] = useState({});

    const updateBcv = rowN => {
        const newCurrentRowCV = ingredient[rowN][0].split(":")
        postEmptyJson(
            `/navigation/bcv/${systemBcv["bookCode"]}/${newCurrentRowCV[0]}/${newCurrentRowCV[1]}`,
            debugRef.current
        );

    }

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
                    const query = `{
                        docSets { 
                            documents {
                                cvIndex(chapter : ${systemBcv.chapterNum}){  
                                verses{
                                        verse{
                                                text 
                                                verseRange
                                                }
                                        }
                                }
                            }
                        }
                    }`;
                    const result = pk.gqlQuerySync(query);
                    console.log("result", result)
                    setVerseText(result.data.docSets[0].documents[0].cvIndex.verses.map(v => v.verse).filter(v => v.length > 0).map(v => v[0]));
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
            return <b style={{ fontSize: "smaller", paddingRight: "0.25em" }}>{item.payload.split("/")[1]}</b>
        } else {
            return ""
        }
    }

    return <div className={adjSelectedFontClass}>
        <pre>
            {
                JSON.stringify(verseText, null, 2)
            }
        </pre>

    </div>
}

export default DraftingEditor;