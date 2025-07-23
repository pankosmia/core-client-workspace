import { useState } from "react";
import { Box, IconButton } from "@mui/material";
import DeleteNote from "./DeleteNote";
import DeleteIcon from '@mui/icons-material/Delete';

import RestoreIcon from '@mui/icons-material/Restore';
import CheckIcon from '@mui/icons-material/Check';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

function ActionsButtons({ ingredient, setIngredient, currentRowN, setCurrentRowN, cellValueChanged, setCellValueChanged, updateBcv, rowData, handleCancel, mode, saveFunction, handleCloseModalNewNote }) {
    const [openedModalDelete, setOpenedModalDelete] = useState(false);

    // Permet d'ouvrir la modal Delete
    const handleOpenModalDelete = () => {
        setOpenedModalDelete("delete");
    };

    // changer de page -1 
    const previousRow = () => {
        const newRowN = currentRowN - 1;
        if (newRowN >= 1 && ingredient.length > 1 && ingredient[newRowN]) {
            //updateBcv(newRowN);
            setCurrentRowN(newRowN);
            setCellValueChanged(false)
        }
    };

    // changer de page +1
    const nextRow = () => {
        const newRowN = currentRowN + 1;
        if (ingredient.length > 1 && ingredient[newRowN]) {
            //updateBcv(newRowN);
            setCurrentRowN(newRowN);
            setCellValueChanged(false)
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 2, padding: 1, justifyContent: "center" }}>
                {mode === "edit" && (
                    <>
                        <IconButton
                            variant="contained"
                            onClick={() => { previousRow(); saveFunction(currentRowN, rowData) }}
                            sx={{
                                mt: 2,
                                "&.Mui-disabled": {
                                    background: "#eaeaea",
                                    color: "#424242"
                                }
                            }}
                        >
                            <ArrowBackIosNewIcon />
                        </IconButton>

                        <IconButton
                            onClick={() => { saveFunction(currentRowN, rowData); setCellValueChanged(false) }}
                            variant="contained"
                            disabled={!cellValueChanged}
                            sx={{
                                mt: 2,
                                "&.Mui-disabled": {
                                    background: "#eaeaea",
                                    color: '#bebbbbff'
                                }
                            }}
                        >
                            <CheckIcon size="large" color={!cellValueChanged ? "#eaeaea" : "primary"} />
                        </IconButton>

                        <IconButton
                            onClick={() => {
                                handleCancel();
                                setCellValueChanged(false);
                            }}
                            variant="contained"
                            disabled={!cellValueChanged}
                            sx={{
                                mt: 2,
                                "&.Mui-disabled": {
                                    background: "#eaeaea",
                                    color: '#bebbbbff'
                                }
                            }}
                        >
                            <RestoreIcon size="large" color={!cellValueChanged ? "#eaeaea" : "primary"} />
                        </IconButton>

                        <IconButton
                            onClick={() => handleOpenModalDelete()}
                            sx={{
                                mt: 2,
                                "&.Mui-disabled": {
                                    background: "#eaeaea",
                                    color: '#bebbbbff'
                                }
                            }}
                            disabled={ingredient[currentRowN] && ingredient[currentRowN].length === 1}
                        >
                            <DeleteIcon size="large" color={ingredient[currentRowN] && ingredient[currentRowN].length === 1 ? "#eaeaea" : "primary"} />
                        </IconButton>

                        <IconButton
                            onClick={() => { nextRow(); saveFunction(currentRowN, rowData) }} variant="contained"
                            sx={{
                                mt: 2,
                                "&.Mui-disabled": {
                                    background: "#eaeaea",
                                    color: "#424242"
                                }
                            }}
                        >
                            <ArrowForwardIosIcon />
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