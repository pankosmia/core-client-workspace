import { Unstable_NumberInput as NumberInput } from '@mui/base/Unstable_NumberInput';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import FastForwardIcon from '@mui/icons-material/FastForward';
import { Box, IconButton } from "@mui/material";
import { ButtonGroup } from '@mui/material';
import { useEffect, useState } from 'react';
import { getJson } from 'pithekos-lib';

function NavBarDrafting({ currentPosition, setCurrentPosition, metadata, chapterNumbers, systemBcv, currentBookCode, setCurrentBookCode }) {
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
    }, []);

    useEffect(() => {
        if ((!currentPosition && chapterNumbers.length > 0) || currentBookCode !== systemBcv.bookCode ) {
            setCurrentPosition(chapterNumbers[0]);
            setCurrentBookCode(systemBcv.bookCode);
            console.log("bookcode",currentBookCode)
        }    
    },[chapterNumbers,currentPosition,setCurrentPosition, systemBcv.bookCode, currentBookCode,setCurrentBookCode]);
    
    console.log("chapterNumbers",chapterNumbers)

// changer de page -1 
const previousChapter = () => {
    const index = chapterNumbers.indexOf(currentPosition);
    if (index > 0) {
        setCurrentPosition(chapterNumbers[index - 1]);
    }
};

// changer de page +1
const nextChapter = () => {
    const index = chapterNumbers.indexOf(currentPosition);
    if (index < chapterNumbers.length - 1) {
        setCurrentPosition(chapterNumbers[index + 1]);
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
                value={`Chap ${currentPosition}`}
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