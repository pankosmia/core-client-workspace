import { useContext, useState } from "react";
import { Box, Button, IconButton } from "@mui/material";
import DeleteNote from "./DeleteNote";
import DeleteIcon from '@mui/icons-material/Delete';
import {
    i18nContext as I18nContext,
    doI18n,
} from "pithekos-lib";

function ActionsButtons({ ingredient, setIngredient, currentRowN, setCurrentRowN, cellValueChanged, setCellValueChanged, updateBcv, rowData, handleCancel, mode, saveFunction }) {
    const { i18nRef } = useContext(I18nContext);
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
        if (ingredient[newRowN]) {
            //updateBcv(newRowN);
            setCurrentRowN(newRowN);
            setCellValueChanged(false)
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 2, padding: 1, justifyContent: "center" }}>
                {mode === "edit" && (

                    <Button
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
                        {doI18n("pages:core-local-workspace:previous", i18nRef.current)}
                    </Button>
                )}
                <Button
                    onClick={() => { saveFunction(currentRowN, rowData); setCellValueChanged(false) }}
                    variant="contained"
                    disabled={!cellValueChanged}
                    sx={{
                        mt: 2,
                        "&.Mui-disabled": {
                            background: "#eaeaea",
                            color: "#424242"
                        }
                    }}
                >
                    {mode === "edit" ? `${doI18n("pages:core-local-workspace:ok", i18nRef.current)}` : `${doI18n("pages:core-local-workspace:save_note", i18nRef.current)}`}
                </Button>
                {mode === "edit" && (
                    <>
                        <Button
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
                                    color: "#424242"
                                }
                            }}
                        >
                            {doI18n("pages:core-local-workspace:reset", i18nRef.current)}
                        </Button>

                        <IconButton
                            onClick={() => handleOpenModalDelete()}
                            sx={{
                                mt: 2
                            }}
                        >
                            <DeleteIcon size="large" color="primary" />
                        </IconButton>

                        <Button
                            onClick={() => { nextRow(); saveFunction(currentRowN, rowData) }} variant="contained"
                            sx={{
                                mt: 2,
                                "&.Mui-disabled": {
                                    background: "#eaeaea",
                                    color: "#424242"
                                }
                            }}
                        >
                            {doI18n("pages:core-local-workspace:next", i18nRef.current)}
                        </Button>
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