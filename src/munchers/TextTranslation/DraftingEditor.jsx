import { useEffect, useContext, useState } from "react";
import { Proskomma } from 'proskomma-core';
import {
    bcvContext as BcvContext,
    debugContext as DebugContext,
    getJson,
    getText,
} from "pithekos-lib";
import { Box, FormControl, TextField } from "@mui/material";
import RequireResources from "../../components/RequireResources";
import juxta2Units from "../../components/juxta2Units";
import NavBarDrafting from "../../components/NavBarDrafting";

function DraftingEditor({ metadata, adjSelectedFontClass }) {
    const { systemBcv } = useContext(BcvContext);
    const { debugRef } = useContext(DebugContext);
    const [units, setUnits] = useState([]);
    const [currentChapter, setCurrentChapter] = useState(1);
    const [pk, setPk] = useState(null);
    const [unitData, setUnitData] = useState([]);
    const [isDownloading, setIsDownloading] = useState(false);
    const [selectedRef, setSelectedRef] = useState({currentChapter:0 ,ref: 0})
   
    // const updateBcv = rowN => {
    //     const newCurrentRowCV = ingredient[rowN][0].split(":")
    //     postEmptyJson(
    //         `/navigation/bcv/${systemBcv["bookCode"]}/${newCurrentRowCV[0]}/${newCurrentRowCV[1]}`,
    //         debugRef.current
    //     );

    // }
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

    useEffect(()=>{
        setSelectedRef()
    },[currentChapter])

    useEffect(
        () => {
            const getProskomma = async () => {
                let usfmResponse = await getText(`/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.usfm`,
                    debugRef.current
                );
                if (usfmResponse.ok) {
                    const newPk = new Proskomma();
                    newPk.importDocument({
                        lang: "xxx",
                        abbr: "yyy"
                    },
                        "usfm",
                        usfmResponse.text
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
        setIsDownloading(false)
    }
    
    console.log("selectedRef", selectedRef)
    useEffect(() => {
        getUnitTexts().then()
    }, [units]);

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
            <NavBarDrafting currentChapter={currentChapter} units={units} setCurrentChapter={setCurrentChapter} selectedRef={selectedRef} setSeletedRef={selectedRef} />
            <Box>
                {unitData
                    .filter(u => u.reference.startsWith(`${currentChapter}:`))
                    .map((u, index) => {
                        return (
                            <Box key={index} >
                                <FormControl fullWidth margin="normal">
                                    <TextField
                                        label={u.reference}
                                        value={u.text}
                                        multiline
                                        minRows={9}
                                        maxRows={9}
                                        onFocus={()=> {console.log("focus", u.reference)}}
                                        onBlur={()=> {console.log("blur",u.reference)}}
                                        autoFocus={selectedRef === u.reference}
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