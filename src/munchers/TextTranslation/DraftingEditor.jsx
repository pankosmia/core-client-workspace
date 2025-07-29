import { useEffect, useContext, useState } from "react";
import { Proskomma } from 'proskomma-core';
import {
    bcvContext,
    bcvContext as BcvContext,
    debugContext as DebugContext,
    getJson,
    getText,
    postEmptyJson,
} from "pithekos-lib";
import { Box, FormControl, TextField } from "@mui/material";
import RequireResources from "../../components/RequireResources";
import juxta2Units from "../../components/juxta2Units";
import NavBarDrafting from "../../components/NavBarDrafting";
import SaveButtonDrafting from "../../components/SaveButtonDrafting";
import md5 from "md5";

function DraftingEditor({ metadata, adjSelectedFontClass }) {
    const { systemBcv } = useContext(BcvContext);
    const { debugRef } = useContext(DebugContext);
    const [units, setUnits] = useState([]);
    const [currentChapter, setCurrentChapter] = useState(1);
    const [pk, setPk] = useState(null);
    const [unitData, setUnitData] = useState([]);
    const [isDownloading, setIsDownloading] = useState(false);
    const [currentText, setCurrentText] = useState("");
    const [selectedReference, setSelectedReference] = useState("");
    const [usfmHeader, setUsfmHeader] = useState("");
    const [md5Usfm, setMd5Usfm] = useState([]);
    const {bcvRef} = useContext(BcvContext);
   
    useEffect(() => {
        const juxtaJson = async () => {
            let jsonResponse = await getJson(`/burrito/ingredient/raw/git.door43.org/BurritoTruck/fr_juxta/?ipath=${systemBcv.bookCode}.json`, debugRef.current);
            if (jsonResponse.ok) {
                let newUnits = juxta2Units(jsonResponse.json)
                setUnits(newUnits)
            }
        }
        juxtaJson().then()
    }, [debugRef, systemBcv.bookCode])

    useEffect(
        () => {
            const getProskomma = async () => {
                let usfmResponse = await getText(`/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.usfm`,
                    debugRef.current
                );
                if (usfmResponse.ok) {
                    const usfmText = usfmResponse.text
                    setUsfmHeader(usfmText.split("\\c")[0])
                    const newPk = new Proskomma();
                    newPk.importDocument({
                        lang: "xxx",
                        abbr: "yyy"
                    },
                        "usfm",
                        usfmText
                    );
                    setPk(newPk)
                }
            };
            getProskomma().then();
        },
        [debugRef, systemBcv.bookCode, systemBcv.chapterNum, systemBcv.verseNum, metadata.local_path]
    );
    const getUnitTexts = async () => {

        let newUnitData = []
        setIsDownloading(true)
        for (const cv of units) {
            const query = `{
                documents {
                    mainSequence {
                        blocks(withScriptureCV:"${cv}"){
                            items(withScriptureCV:"${cv}") {
                                type subType payload
                            }
                        }
                    }

                }
            }`
            const result = await pk.gqlQuery(query)
            const cvText = result.data.documents[0].mainSequence.blocks
                .map(b => b.items
                    .filter(i => i.type === "token")
                    .map(i => i.payload)
                    .join("")
                ).join("\n\n")
            newUnitData.push({ reference: cv, text: cvText })
        }
        setUnitData(newUnitData)
        const hash = md5(JSON.stringify(newUnitData));
        setMd5Usfm(hash);
        setIsDownloading(false)
    }

    useEffect(() => {
        if (pk) {
            getUnitTexts().then()
        }
    }, [units, pk,systemBcv.chapterNum]);

     const updateBcv = unitN => {
        if (unitData[unitN]) {
            const newCurrentUnitCV = unitData[unitN].reference.split(":")
            postEmptyJson(
                `/navigation/bcv/${systemBcv["bookCode"]}/${newCurrentUnitCV[0]}/${newCurrentUnitCV[1]}`,
                debugRef.current
            );
        }

    }

    const handleSaveUnit = (unitN, newText) => {
        const newUnit = { ...unitData[unitN], text: newText }
        let newUnitData = [...unitData]
        newUnitData[unitN] = newUnit
        setUnitData(newUnitData)
    }

    const contentSpec = {
        "general": {
            "ntjxt": {
                "_all": {
                    "dcs": {
                        "name": "Juxtalinéaire grec-français du Nouveau Testament, créée par Xenizo (NTJXT)",
                        "repoPath": "git.door43.org/BurritoTruck/fr_juxta"
                    }
                }
            }
        }
    }

    if (isDownloading) {
        return <p>loading...</p>
    }
    return (
        <RequireResources contentSpec={contentSpec}>
            <SaveButtonDrafting
                metadata={metadata}
                systemBcv={systemBcv}
                usfmHeader={usfmHeader}
                unitData={unitData}
                md5Usfm={md5Usfm}
                setMd5Usfm={setMd5Usfm}
            />
            <NavBarDrafting currentChapter={currentChapter} setCurrentChapter={setCurrentChapter} units={units} />
            <Box>
                {unitData
                    .filter(u => u.reference.startsWith(`${currentChapter}:`))
                    .map((u, index) => {
                        return (
                            <Box key={index} >
                                <FormControl fullWidth margin="normal">
                                    <TextField
                                        label={u.reference}
                                        value={u.reference === selectedReference ? currentText : u.text}
                                        multiline
                                        minRows={3}
                                        maxRows={9}
                                        autoFocus={u.reference === selectedReference}
                                        onFocus={() => {
                                            setCurrentText(u.text);
                                            setSelectedReference(u.reference)
                                            //updateBcv(index)
                                        }}
                                        onChange={(e) => {
                                            setCurrentText(e.target.value)
                                        }}
                                        onBlur={() => handleSaveUnit(index, currentText)}
                                    />
                                </FormControl>
                            </Box>
                        );
                    })
                }
            </Box>
        </RequireResources>
    );
}

export default DraftingEditor;