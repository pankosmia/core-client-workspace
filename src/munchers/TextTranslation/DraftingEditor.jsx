import { useEffect, useContext, useState } from "react";
import { Proskomma } from 'proskomma-core';
import {
    bcvContext as BcvContext,
    debugContext as DebugContext,
    getText,
} from "pithekos-lib";
import { Box, FormControl, TextareaAutosize, FormLabel, TextField } from "@mui/material";


function DraftingEditor({ metadata, adjSelectedFontClass }) {
    const { systemBcv } = useContext(BcvContext);
    const { debugRef } = useContext(DebugContext);
    const [verseText, setVerseText] = useState([]);

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

                    setVerseText(result.data.docSets[0].documents[0].cvIndex.verses.map(v => v.verse).filter(v => v.length > 0).map(v => v[0]));
                } else {
                    setVerseText([]);
                }
            };
            getVerseText().then();
        },
        [debugRef, systemBcv.bookCode, systemBcv.chapterNum, systemBcv.verseNum, metadata.local_path]
    );

    return (
        <Box>
            <FormLabel> Chap {systemBcv.chapterNum}</FormLabel>
            {verseText.map((column, index) => (
                <Box >
                    <FormControl fullWidth margin="normal" key={index}>
                        <FormLabel>{`Verset ${column.verseRange}`}</FormLabel>
                        <TextField
                            label={column.text}
                            value={column.text}
                            multiline
                            minRows={5}
                            maxRows={5}
                        />
                    </FormControl>
                </Box>
            ))}
        </Box>
    );
}

export default DraftingEditor;