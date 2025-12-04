import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Box, IconButton, MenuItem, TextField } from "@mui/material";
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

    }, [chapterNumbers, systemBcv, currentBookCode, bcvRef, debugRef]);

    // changer de page -1 
    const previousChapter = () => {
        if (currentPosition > 0) {
            setCurrentPosition(currentPosition - 1);
            postEmptyJson(
                `/navigation/bcv/${systemBcv["bookCode"]}/${chapterNumbers[currentPosition - 1]}/1`,
                debugRef.current);
        }
    };


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

    const handleClickMenuChapter = (i) => {
        setCurrentPosition(i);
            postEmptyJson(
                `/navigation/bcv/${systemBcv["bookCode"]}/${chapterNumbers[i]}/1`,
                debugRef.current
            );
    }
   
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {scriptDirection === "ltr" ? (
                <ButtonGroup>
                    <IconButton disabled={currentPosition < 1} onClick={() => { previousChapter() }}>
                        <KeyboardArrowLeftIcon fontSize="large" />
                    </IconButton>
                </ButtonGroup>
            ) :
                <ButtonGroup>
                    <IconButton onClick={() => { previousChapter() }}>
                        <KeyboardArrowRightIcon fontSize="large" />
                    </IconButton>
                </ButtonGroup>
            }

            <TextField
                label={`Ch`}
                select
                size="small"
                value={currentPosition}
            >
                {chapterNumbers.map((chapter, index) => (
                    <MenuItem 
                        onClick={() => handleClickMenuChapter(index)} 
                        key={index} 
                        value={index}
                        sx={{maxHeight:"3rem", height:"2rem"}}
                        >
                        {chapter}
                    </MenuItem>
                ))}
            </TextField>


            {scriptDirection === "ltr" ? (
                <ButtonGroup>
                    <IconButton disabled={currentPosition >= (chapterNumbers.length - 1)} onClick={() => { nextChapter() }}>
                        <KeyboardArrowRightIcon fontSize="large" />
                    </IconButton>
                </ButtonGroup>
            ) :
                <ButtonGroup>
                    <IconButton onClick={() => { nextChapter() }}>
                        <KeyboardArrowLeftIcon fontSize="large" />
                    </IconButton>
                </ButtonGroup>
            }
        </Box>
    )
}

export default NavBarDrafting;