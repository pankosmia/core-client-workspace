import { Unstable_NumberInput as NumberInput } from '@mui/base/Unstable_NumberInput';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import FastForwardIcon from '@mui/icons-material/FastForward';
import { Box, IconButton } from "@mui/material";
import { ButtonGroup } from '@mui/material';

function NavBarDrafting({ units, currentChapter, setCurrentChapter }) {
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
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ButtonGroup>
                <IconButton onClick={() => { previousChapter() }}>
                    <FastRewindIcon fontSize="large" />
                </IconButton>
            </ButtonGroup>

            <Box sx={{
                border: '1px solid #DAE2ED',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                backgroundColor: '#fafafa',
            }}>
                <NumberInput
                    value={`Chap ${currentChapter}`}
                />
            </Box>

            <ButtonGroup>
                <IconButton onClick={() => { nextChapter() }}>
                    <FastForwardIcon fontSize="large" />
                </IconButton>
            </ButtonGroup>
        </Box>
    )
}

export default NavBarDrafting;