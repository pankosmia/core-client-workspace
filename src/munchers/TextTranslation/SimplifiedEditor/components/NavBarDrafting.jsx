import { Unstable_NumberInput as NumberInput } from '@mui/base/Unstable_NumberInput';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import FastForwardIcon from '@mui/icons-material/FastForward';
import { Box, IconButton } from "@mui/material";
import { ButtonGroup } from '@mui/material';
import { useEffect, useState } from 'react';
import { getJson } from 'pithekos-lib';

function NavBarDrafting({ currentChapter, setCurrentChapter, metadata, chapterNumbers,systemBcv }) {
    const [scriptDirection, setScriptDirection] = useState([]);

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
    },[]);

    useEffect(() => {
        if ((currentChapter === 0 && systemBcv.bookCode) || systemBcv.bookCode ) {
            setCurrentChapter(chapterNumbers[0]);
        }
    }, [chapterNumbers, setCurrentChapter,currentChapter,systemBcv.bookCode]);
    console.log("systembcvB",systemBcv.bookCode)
    // changer de page -1 
    const previousChapter = () => {
        if (!chapterNumbers || chapterNumbers.length === 0) return;

        const index = chapterNumbers.indexOf(currentChapter);
        if (index > 0) {
            setCurrentChapter(chapterNumbers[index - 1]);
        }
    };

    // changer de page +1
    const nextChapter = () => {
        if (!chapterNumbers || chapterNumbers.length === 0) return;

        const index = chapterNumbers.indexOf(currentChapter);
        if (index < chapterNumbers.length - 1) {
            setCurrentChapter(chapterNumbers[index + 1]);
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {scriptDirection === "ltr" ? (
                <ButtonGroup>
                    <IconButton onClick={() => { previousChapter() }}>
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
                    value={`Chap ${currentChapter}`}
                />
            </Box>

            {scriptDirection === "ltr" ? (
                <ButtonGroup>
                    <IconButton onClick={() => { nextChapter() }}>
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