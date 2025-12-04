import { Unstable_NumberInput as NumberInput } from '@mui/base/Unstable_NumberInput';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import FastForwardIcon from '@mui/icons-material/FastForward';
import { Box, IconButton } from "@mui/material";
import { ButtonGroup } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { bcvContext, debugContext, getJson, postEmptyJson } from 'pithekos-lib';

function NavBarDrafting({ metadata, chapterNumbers, systemBcv }) {
    const [scriptDirection, setScriptDirection] = useState([]);
    const { bcvRef } = useContext(bcvContext);
    const [currentBookCode, setCurrentBookCode] = useState("zzz")
    const [currentPosition, setCurrentPosition] = useState(0);
    const { debugRef } = useContext(debugContext);

    const ProjectScriptDirection = async () => {
        const summariesResponse = await getJson(`/burrito/metadata/summary/${metadata.local_path}`);
        if (summariesResponse.ok) {
            const data = summariesResponse.json;
            const bookCode = data.script_direction;
            setScriptDirection(bookCode);
        } else {
            console.error(" Erreur lors de la récupération des données.");
        }

    };

    useEffect(() => {
        ProjectScriptDirection();
    }, []);

    useEffect(() => {
        if (chapterNumbers.length > 0 && currentBookCode !== bcvRef.current.bookCode) {
            // postEmptyJson(
            //     `/navigation/bcv/${systemBcv["bookCode"]}/${chapterNumbers[0]}/1`,
            //     debugRef.current);
            setCurrentBookCode(bcvRef.current.bookCode);
            setCurrentPosition(0)

        }

    }, [chapterNumbers, systemBcv,currentBookCode, bcvRef,debugRef]);

    // changer de page -1 
    const previousChapter = () => {
        if (currentPosition > 0) {
            setCurrentPosition(currentPosition - 1);
            postEmptyJson(
                `/navigation/bcv/${systemBcv["bookCode"]}/${chapterNumbers[currentPosition - 1]}/1`,
                debugRef.current);
        }
    };

    console.log(systemBcv.chapterNum)
    console.log("chapternubers", chapterNumbers)
    // changer de page +1
    const nextChapter = () => {
        if (currentPosition < chapterNumbers.length - 1) {
            setCurrentPosition(currentPosition + 1);
            postEmptyJson(
                `/navigation/bcv/${systemBcv["bookCode"]}/${chapterNumbers[currentPosition + 1]}/1`,
                debugRef.current
            );
        }
    };
    console.log("chapterNumbers & currentPosition", chapterNumbers, currentPosition);
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {scriptDirection === "ltr" ? (
                <ButtonGroup>
                    <IconButton disabled={currentPosition < 1} onClick={() => { previousChapter() }}>
                        <FastRewindIcon fontSize="large" />
                    </IconButton>
                </ButtonGroup>
            ) :
                <ButtonGroup>
                    <IconButton onClick={() => { previousChapter() }}>
                        <FastForwardIcon fontSize="large" />
                    </IconButton>
                </ButtonGroup>
            }

            <Box
                sx={{
                    border: '1px solid #DAE2ED',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    backgroundColor: '#fafafa',
                }}
            >
                <NumberInput
                    value={`Chap ${chapterNumbers[currentPosition]}`}
                />
            </Box>

            {scriptDirection === "ltr" ? (
                <ButtonGroup>
                    <IconButton disabled={currentPosition >= (chapterNumbers.length - 1)} onClick={() => { nextChapter() }}>
                        <FastForwardIcon fontSize="large" />
                    </IconButton>
                </ButtonGroup>
            ) :
                <ButtonGroup>
                    <IconButton onClick={() => { nextChapter() }}>
                        <FastRewindIcon fontSize="large" />
                    </IconButton>
                </ButtonGroup>
            }
        </Box>
    )
}

export default NavBarDrafting;