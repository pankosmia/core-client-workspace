import { useContext, useState } from "react";
import { Box, Button, IconButton, Menu, MenuItem, TextField } from "@mui/material";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import {
    bcvContext as BcvContext,
} from "pithekos-lib";

function ActionsButtons({ ingredient, currentRowN, setCurrentRowN, setCellValueChanged, updateBcv, rowData, mode, saveFunction }) {
    const { systemBcv, setSystemBcv } = useContext(BcvContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    // changer de chapitre -1
    const previousChap = () => {
        let newRowN = currentRowN - 1;
        const currentChap = ingredient[currentRowN][0].split(":")[0];

        while (newRowN >= 1) {
            const newChap = ingredient[newRowN][0].split(":")[0];
            if (newChap !== currentChap) break;
            newRowN--;
        }

        if (newRowN >= 1 && ingredient[newRowN]) {
            saveFunction(currentRowN, rowData);
            setCurrentRowN(newRowN);
            setCellValueChanged(false);
            updateBcv(newRowN);
        }
    };


    // changer de page -1 
    const previousRow = () => {
        const newRowN = currentRowN - 1;
        if (newRowN >= 1 && ingredient.length > 1 && ingredient[newRowN]) {
            saveFunction(currentRowN, rowData);
            setCurrentRowN(newRowN);
            setCellValueChanged(false)
            updateBcv(newRowN)
        }
    };

    // changer de page +1
    const nextRow = () => {
        const newRowN = currentRowN + 1;
        if (ingredient[newRowN] && ingredient[newRowN].length > 0) {
            saveFunction(currentRowN, rowData);
            setCurrentRowN(newRowN);
            setCellValueChanged(false)
            updateBcv(newRowN)
        }
    };

    const nextChap = () => {
        let newRowN = currentRowN + 1;
        const currentChap = ingredient[currentRowN][0].split(":")[0];

        while (newRowN < ingredient.length) {
            const newChap = ingredient[newRowN][0].split(":")[0];
            if (newChap !== currentChap) break;
            newRowN++;
        }

        if (newRowN < ingredient.length && ingredient[newRowN]) {
            saveFunction(currentRowN, rowData);
            setCurrentRowN(newRowN);
            setCellValueChanged(false);
            updateBcv(newRowN);
        }
    };

    const verseNotes = {};

    ingredient.slice(1).forEach(row => {
        const verse = row[0];
        const note = row[6];

        const match = verse.match(/^(\d+):/);
        if (match) {
            const chapter = match[1];

            if (!verseNotes[chapter]) {
                verseNotes[chapter] = [];
            }

            verseNotes[chapter].push({
                verse,
                note: note.trim() || "(pas de note)"
            });
        }
    });

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 2, padding: 1, justifyContent: "center" }}>
                {mode === "edit" && (
                    <>
                        <IconButton
                            variant="contained"
                            onClick={() => { previousChap(currentRowN, rowData) }}
                            sx={{
                                mt: 2,
                                "&.Mui-disabled": {
                                    color: "#424242"
                                }
                            }}
                        >
                            <KeyboardDoubleArrowLeftIcon />
                        </IconButton>

                        <IconButton
                            variant="contained"
                            onClick={() => { previousRow() }}
                            sx={{
                                mt: 2,
                                "&.Mui-disabled": {
                                    color: "#424242"
                                }
                            }}
                        >
                            <KeyboardArrowLeftIcon />
                        </IconButton>
                        <Box
                            component="form"
                            sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}
                            noValidate
                            autoComplete="off"
                        >

                            <TextField
                                select
                                label={systemBcv.bookCode}
                                defaultValue={systemBcv.bookCode}
                            >
                                {verseNotes[currentRowN]?.map((item, i) => (
                                    <MenuItem key={i} >
                                        <strong>{item.verse}</strong> : {item.note}
                                    </MenuItem>
                                ))}

                            </TextField>
                            <Button
                                id="basic-button"
                                aria-controls={open ? 'basic-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={open ? 'true' : undefined}
                                onClick={handleClick}
                               sx={{justifyItems:"end"}}
                            >
                                10
                            </Button>
                            <Menu
                                id="basic-menu"
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                                slotProps={{
                                    list: {
                                        'aria-labelledby': 'basic-button',
                                    },
                                }}
                            >
                                {verseNotes[currentRowN]?.map((item, i) => (
                                    <MenuItem key={i} >
                                        <strong>{item.verse.split(":")[1]}</strong>
                                    </MenuItem>
                                ))}
                            </Menu>

                        </Box>

                        <IconButton
                            onClick={() => { nextRow() }} variant="contained"
                            sx={{
                                mt: 2,
                                "&.Mui-disabled": {
                                    color: "#424242"
                                }
                            }}
                        >
                            <KeyboardArrowRightIcon />
                        </IconButton>

                        <IconButton
                            variant="contained"
                            onClick={() => { nextChap() }}
                            sx={{
                                mt: 2,
                                "&.Mui-disabled": {
                                    color: "#424242"
                                }
                            }}
                        >
                            <KeyboardDoubleArrowRightIcon />
                        </IconButton>
                    </>
                )}
            </Box>
        </Box>
    )
}

export default ActionsButtons;