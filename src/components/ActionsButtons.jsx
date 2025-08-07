import { useState } from "react";
import { Box, IconButton } from "@mui/material";
import DeleteNote from "./DeleteNote";
import DeleteIcon from '@mui/icons-material/Delete';

import RestoreIcon from '@mui/icons-material/Restore';
import CheckIcon from '@mui/icons-material/Check';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

function ActionsButtons({ ingredient, setIngredient, currentRowN, setCurrentRowN, cellValueChanged, setCellValueChanged, updateBcv, rowData, handleCancel, mode, saveFunction, handleCloseModalNewNote }) {
    const [openedModalDelete, setOpenedModalDelete] = useState(false);

    // Permet d'ouvrir la modal Delete
    const handleOpenModalDelete = () => {
        setOpenedModalDelete("delete");
    };

    // changer de chapitre -1
     const previousChap = () => {
        const newChapN = currentRowN - 1;
        if (newChapN >= 1 && ingredient.length > 1 && ingredient[newChapN]) {
            saveFunction(currentRowN, rowData);
            setCurrentRowN(newChapN);
            setCellValueChanged(false)
            updateBcv(newChapN)
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
        const newChapN = currentRowN;
          if (ingredient[newChapN] && ingredient[newChapN].length > 0) {
            saveFunction(currentRowN, rowData);
            setCurrentRowN(newChapN);
            setCellValueChanged(false)
            updateBcv(newChapN)
        }
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 2, padding: 1, justifyContent: "center" }}>
                {mode === "edit" && (
                    <>
                        <IconButton
                            variant="contained"
                            onClick={() => { previousChap() }}
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

                        {/* <IconButton
                            onClick={() => { saveFunction(currentRowN, rowData); setCellValueChanged(false) }}
                            variant="contained"
                            disabled={!cellValueChanged}
                            sx={{
                                mt: 2,
                                "&.Mui-disabled": {
                                    color: '#bebbbbff'
                                }
                            }}
                        >
                            <CheckIcon size="large" color={!cellValueChanged ? "#eaeaea" : "primary"} />
                        </IconButton> */}
                        <IconButton
                            onClick={() => handleOpenModalDelete()}
                            sx={{
                                mt: 2,
                                "&.Mui-disabled": {
                                    color: '#bebbbbff'
                                }
                            }}
                            disabled={ingredient[currentRowN] && ingredient[currentRowN].length === 1}
                        >
                            <DeleteIcon size="large" color={ingredient[currentRowN] && ingredient[currentRowN].length === 1 ? "#eaeaea" : "primary"} />
                        </IconButton>
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
            <DeleteNote
                mode="delete"
                open={openedModalDelete === "delete"}
                closeModal={() => setOpenedModalDelete(null)}
                ingredient={ingredient}
                setIngredient={setIngredient}
                rowData={rowData}
                currentRowN={currentRowN}
            />
        </Box>
    )
}

export default ActionsButtons;