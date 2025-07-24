import { useEffect, useContext, useState } from "react";
import { Proskomma } from 'proskomma-core';
import {
    bcvContext as BcvContext,
    debugContext as DebugContext,
    getJson,
    getText,
    postEmptyJson
} from "pithekos-lib";
import { Box, FormControl, FormLabel, TextField } from "@mui/material";
import RequireResources from "../../components/RequireResources";
import juxta2Units from "../../components/juxta2Units";
import NavBarDrafting from "../../components/NavBarDrafting";

function DraftingEditor({ metadata, adjSelectedFontClass }) {
    const { systemBcv } = useContext(BcvContext);
    const { debugRef } = useContext(DebugContext);
    const [newUnits, setNewUnits] = useState([]);
    const [currentChapter, setCurrentChapter] = useState(1);
    const [pk, setPk] = useState(null)

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
                let units = juxta2Units(jsonResponse.json)
                setNewUnits(units)
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
    const getUnitText = (cv)=> {
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
        const result = pk.gqlQuerySync(query)
        return result.data.documents[0].mainSequence.blocks
            .map(b => b.items
                .filter(i => i.type === "token")
                    .map(i => i.payload)
                        .join("")
            ).join("\n\n")
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

    return (
        <RequireResources contentSpec={contentSpec}>
            <NavBarDrafting currentChapter={currentChapter} newUnits={newUnits} setCurrentChapter={setCurrentChapter} />
            <Box>
                {newUnits
                    .filter(ref => ref.startsWith(`${currentChapter}:`))
                    .map((ref, index) => (
                        <Box>
                            <FormControl fullWidth margin="normal" key={index}>
                                <TextField
                                    label={ref}
                                    value={getUnitText(ref)}
                                    multiline
                                    minRows={4}
                                    maxRows={4}
                                />
                            </FormControl>
                        </Box>
                    ))
                }
            </Box>

        </RequireResources>

    );
}

export default DraftingEditor;