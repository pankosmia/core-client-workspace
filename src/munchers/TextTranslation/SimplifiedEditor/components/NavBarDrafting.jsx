import { Unstable_NumberInput as NumberInput } from '@mui/base/Unstable_NumberInput';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import FastForwardIcon from '@mui/icons-material/FastForward';
import { Box, IconButton, Typography } from "@mui/material";
import { ButtonGroup } from '@mui/material';
import { useEffect, useState } from 'react';
import { getJson } from 'pithekos-lib';

function NavBarDrafting({ units, currentChapter, setCurrentChapter, metadata }) {
    const [scriptDirection, setScriptDirection] = useState([]);

    const highestChapter = () => units.length === 0 ? 0 : parseInt(units[units.length - 1].split(":")[0])

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

    // changer de page -1 
    const previousChapter = () => {
        const newChapterN = currentChapter - 1;
        if (newChapterN >= 1 && units.length > 1 && units[newChapterN]) {
            setCurrentChapter(newChapterN);

        }
    };

    // changer de page +1
    const nextChapter = () => {
        const newChapterN = currentChapter + 1;
        if (currentChapter < highestChapter()) {
            setCurrentChapter(newChapterN);

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