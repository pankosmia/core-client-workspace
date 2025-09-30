import {useEffect, useContext, useState} from "react";
import md5 from "md5";
import {Proskomma} from 'proskomma-core';
import {
    bcvContext as BcvContext,
    debugContext as DebugContext,
    getJson,
    getText,
    postEmptyJson,
} from "pithekos-lib";
import {Box, FormControl, TextField} from "@mui/material";
import RequireResources from "../../components/RequireResources";
import juxta2Units from "../../components/juxta2Units";
import NavBarDrafting from "../../components/NavBarDrafting";
import SaveButtonDrafting from "../../components/SaveButtonDrafting";

function DraftingEditor({metadata, modified, setModified}) {
    const {systemBcv} = useContext(BcvContext);
    const {debugRef} = useContext(DebugContext);
    const [units, setUnits] = useState([]);
    const [currentChapter, setCurrentChapter] = useState(1);
    const [pk, setPk] = useState(null);
    const [unitData, setUnitData] = useState([]);
    const [isDownloading, setIsDownloading] = useState(false);
    const [currentText, setCurrentText] = useState("");
    const [selectedReference, setSelectedReference] = useState("");
    const [usfmHeader, setUsfmHeader] = useState("");
    const [savedChecksum, setSavedChecksum] = useState(null);

    useEffect(() => {
        const isElectron = !!window.electronAPI;
        if (isElectron) {
            window.electronAPI.setCanClose(!modified);
        }
    }, [modified]);

    const updateBcv = unitN => {
        if (unitData[unitN]) {
            const newCurrentUnitCV = unitData[unitN].reference.split(":")
            postEmptyJson(
                `/navigation/bcv/${systemBcv["bookCode"]}/${newCurrentUnitCV[0]}/${newCurrentUnitCV[1].split("-")[0]}`,
                debugRef.current
            );
        }

    }

    useEffect(() => {
        const juxtaJson = async () => {
            let jsonResponse = await getJson(`/burrito/ingredient/raw/git.door43.org/BurritoTruck/fr_juxta/?ipath=${systemBcv.bookCode}.json`, debugRef.current);
            if (jsonResponse.ok) {
                let newUnits = juxta2Units(jsonResponse.json)
                setUnits(newUnits)
            } else { // Generate from Proskomma versification
                const vrsQuery = `{
                versification(id: "eng") {
                  cvBook(bookCode: "${systemBcv.bookCode}") {
                    chapters {
                      chapter
                      maxVerse
                    }
                  }
                }
                }`;
                const pk = new Proskomma();
                const result = pk.gqlQuerySync(vrsQuery);
                const chapters = result.data.versification.cvBook.chapters;
                setUnits(
                    chapters.map(
                        c => [...Array(c.maxVerse + 1).keys()].map(c2 => `${c.chapter}:${c2}`).slice(1)
                    ).reduce((a, b) => [...a, ...b], [])
                );
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
        [debugRef, systemBcv.bookCode, metadata.local_path]
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
                    .map(i => i.payload.replace(/\s+/g, " "))
                    .join("")
                ).join("\n\n")
            newUnitData.push({reference: cv, text: cvText})
        }
        setUnitData(newUnitData)
        setIsDownloading(false);
        setModified(false);
        setSavedChecksum(md5(JSON.stringify(newUnitData, null, 2)))
    }

    useEffect(() => {
        if (pk) {
            getUnitTexts().then()
        }
    }, [units, pk]);

    const handleCacheUnit = (unitN, newText) => {
        console.log(`text: '${newText}'`)
        const newUnit = {...unitData[unitN], text: newText}
        let newUnitData = [...unitData]
        newUnitData[unitN] = newUnit
        const newChecksum = md5(JSON.stringify(newUnitData, null, 2));
        const notSaved = newChecksum !== savedChecksum;
        if (notSaved !== modified) {
            setModified(notSaved);
        }
        setUnitData(newUnitData)
    }
    
    if (isDownloading) {
        return <p>loading...</p>
    }
    return (
        <>

            <SaveButtonDrafting
                metadata={metadata}
                systemBcv={systemBcv}
                usfmHeader={usfmHeader}
                unitData={unitData}
                modified={modified}
                setModified={setModified}
                setSavedChecksum={setSavedChecksum}
            />
            <NavBarDrafting currentChapter={currentChapter} setCurrentChapter={setCurrentChapter} units={units}/>
            <Box>
                {unitData
                    .map((u, index) => {
                        if (!u.reference.startsWith(`${currentChapter}:`)) {
                            return;
                        }
                        return (
                            <Box key={index}>
                                <FormControl fullWidth margin="normal">
                                    <TextField
                                        label={u.reference}
                                        value={u.reference === selectedReference ? currentText : u.text}
                                        multiline
                                        minRows={6}
                                        maxRows={9}
                                        autoFocus={u.reference === selectedReference}
                                        onFocus={() => {
                                            setCurrentText(u.text);
                                            setSelectedReference(u.reference)
                                            updateBcv(index)
                                        }}
                                        onChange={(e) => {
                                            setCurrentText(e.target.value)
                                        }}
                                        onBlur={() => handleCacheUnit(index, currentText)}
                                    />
                                </FormControl>
                            </Box>
                        );
                    })
                }
            </Box>
        </>
    );
}

export default DraftingEditor;