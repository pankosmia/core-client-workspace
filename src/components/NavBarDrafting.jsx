import { Unstable_NumberInput as NumberInput } from '@mui/base/Unstable_NumberInput';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import FastForwardIcon from '@mui/icons-material/FastForward';
import ArrowRight from '@mui/icons-material/ArrowRight';
import ArrowLeft from '@mui/icons-material/ArrowLeft';
import { Box, IconButton } from "@mui/material";
import { ButtonGroup } from '@mui/material';

function NavBarDrafting({ units, currentChapter, setCurrentChapter, selectedReference }) {
    const highestChapter = () => units.length === 0 ? 0 : parseInt(units[units.length - 1].split(":")[0])
    
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

    // const nextRow = () => {
    //     const newRowN = currentRow + 1;
    //     if(newRown > 0){

    //     }
    // }
    // const previousRow = () => {
    //     const newRowN = currentRow + 1;
    //     if(newRown > 0){

    //     }
    // }selectedRef.split(":")[1]


    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ButtonGroup>
                <IconButton onClick={() => { previousChapter() }}>
                    <FastRewindIcon fontSize="large" />
                </IconButton>
                <IconButton disabled >
                    <ArrowLeft fontSize="large" />
                </IconButton>
            </ButtonGroup>

            <Box sx={{
                border: '1px solid #DAE2ED',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                backgroundColor: '#fafafa',
                paddingX: '1rem',
                paddingY: '0.3rem',
            }}>
                <NumberInput
                    value={`Chap ${currentChapter}`}
                />
                :
                <NumberInput
                    value={selectedReference ? selectedReference.split(":")[1] : ""}
                />
            </Box>

            <ButtonGroup>
                <IconButton disabled >
                    <ArrowRight fontSize="large" />
                </IconButton>
                <IconButton onClick={() => { nextChapter() }}>
                    <FastForwardIcon fontSize="large" />
                </IconButton>
            </ButtonGroup>
        </Box>
    )
}

export default NavBarDrafting;