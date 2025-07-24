import { Unstable_NumberInput as NumberInput } from '@mui/base/Unstable_NumberInput';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import FastForwardIcon from '@mui/icons-material/FastForward';
import ArrowRight from '@mui/icons-material/ArrowRight';
import ArrowLeft from '@mui/icons-material/ArrowLeft';
import { Box, IconButton } from "@mui/material";
import { ButtonGroup } from '@mui/material';

function NavBarDrafting({newUnits, currentChapter, setCurrentChapter }) {
    const highestChapter = () => newUnits.length === 0 ? 0 : parseInt(newUnits[newUnits.length - 1].split(":")[0])
    // changer de page -1 
    const previousRow = () => {
        const newRowN = currentChapter - 1;
        if (newRowN >= 1 && newUnits.length > 1 && newUnits[newRowN]) {
            setCurrentChapter(newRowN);
        }
    };

    // changer de page +1
    const nextChapter = () => {
        const newRowN = currentChapter + 1;
        if ( currentChapter < highestChapter() ) {
            setCurrentChapter(newRowN);
        }
    };
    console.log("changement currentCHapter",currentChapter)
    // return (
    //     <Box>
    //         <Box sx={{ display: 'flex', gap: 2, padding: 1, justifyContent: "center" }}>
    //                 <>
    //                     <IconButton
    //                         variant="contained"
    //                         onClick={() => { previousRow() }}
    //                         sx={{
    //                             mt: 2,
    //                             "&.Mui-disabled": {
    //                                 background: "#eaeaea",
    //                                 color: "#424242"
    //                             }
    //                         }}
    //                     >
    //                         <ArrowBackIosNewIcon />
    //                     </IconButton>
                   
    //                     <IconButton
    //                         onClick={() => { nextRow() }} variant="contained"
    //                         sx={{
    //                             mt: 2,
    //                             "&.Mui-disabled": {
    //                                 background: "#eaeaea",
    //                                 color: "#424242"
    //                             }
    //                         }}
    //                     >
    //                         <ArrowForwardIosIcon />
    //                     </IconButton>
    //                 </>
    //         </Box>
    //     </Box>
    // )

     return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ButtonGroup>
                <IconButton onClick={() => { previousRow() }}>
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
                    // onChange={(event, val) => {
                    //     setObs([val, obs[1]]);
                    // }}
                    // slotProps={StyledNumberInput}
                />
                :
                <NumberInput
                    value={currentChapter}
                    // onChange={(event, val) => {
                    //     setObs([obs[0], val]);
                    // }}
                    // slotProps={StyledNumberInput}
                />
            </Box>

            <ButtonGroup>
                <IconButton disabled >
                    <ArrowRight fontSize="large" />
                </IconButton>
                <IconButton onClick={() => {nextChapter() }}>
                    <FastForwardIcon fontSize="large" />
                </IconButton>
            </ButtonGroup>
        </Box>
    )
}

export default NavBarDrafting;