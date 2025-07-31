import { Unstable_NumberInput as NumberInput } from '@mui/base/Unstable_NumberInput';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import FastForwardIcon from '@mui/icons-material/FastForward';
import { Box, IconButton } from "@mui/material";
import { ButtonGroup } from '@mui/material';
import { useEffect, useState } from 'react';

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

    const StyledNumberInput = {
        root: {
            style: {
                display: 'inline-flex',
                alignItems: 'center',
            }
        },
        input: {
            style: {
                width: 'auto',
                height: '1rem',
                textAlign: 'center',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                outline: 'none',
                '&:focus': {
                    borderColor: '#1976d2',
                    boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                }
            }
        }
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ButtonGroup>
                <IconButton disabled={currentChapter === 1} onClick={() => { previousChapter() }}>
                    <FastRewindIcon fontSize="large" color={currentChapter === 1 ? "#eaeaea" : "primary"} />
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
                    slotProps={StyledNumberInput}
                />
            </Box>

            <ButtonGroup>
                <IconButton disabled={currentChapter === highestChapter()} onClick={() => { nextChapter() }}

                >
                    <FastForwardIcon fontSize="large" color={currentChapter === highestChapter() ? "#eaeaea" : "primary"} />
                </IconButton>
            </ButtonGroup>
        </Box>
    )
}

export default NavBarDrafting;