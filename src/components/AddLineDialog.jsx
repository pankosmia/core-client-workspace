import { useState, useContext } from "react";
import { AppBar, Dialog, IconButton, Toolbar, Typography } from "@mui/material";
import { Close as CloseIcon } from '@mui/icons-material';
import TsvLineForm from "./TsvLineForm";


import {
    i18nContext as I18nContext,
    doI18n,
} from "pithekos-lib";
import ModalCLoseLineDialog from "./ModalCloseLineDialog";

function AddLineDialog({ open, ingredient, setIngredient, currentRowN, setIngredientValueChanged, setSaveIngredientTsv }) {
    const { i18nRef } = useContext(I18nContext);
    const [newCurrentRow, setNewCurrentRow] = useState((ingredient[0] || []).map(c => ""));
    const [openedModalCloseLineDialog, setOpenedModalCloseLineDialog] = useState(false)

     // Permet d'ouvrir la modal de verfication d'enregistrement de la note
    const handleOpenModalCloseLineDialog = () => {
        setOpenedModalCloseLineDialog("closeModalLineDialog");
    };

    // Permet de fermer la modal principale 
    const handleCloseModalMain = () => {
        closeModal();
    }


    // Permet de sauvegarder la nouvelle note
    const handleSaveNewTsvRow = (rowN, newRow) => {
        const newIngredient = [...ingredient];
        newIngredient.splice(rowN, 0, newRow);
        setIngredientValueChanged(true)
        setSaveIngredientTsv(true)
        setIngredient(newIngredient);
    };

    return (
        <Dialog
            fullScreen
            open={open}
            onClose={handleCloseModalMain}
        >
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleCloseModalMain}
                    >
                        <CloseIcon />
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            {doI18n("pages:core-local-workspace:new_bcv_note", i18nRef.current)}
                        </Typography>
                    </IconButton>

                </Toolbar>
            </AppBar>
            <TsvLineForm
                mode="add"
                currentRow={newCurrentRow}
                currentRowN={currentRowN}
                ingredient={ingredient}
                setIngredient={setIngredient}
                saveFunction={handleSaveNewTsvRow}
                setIngredientValueChanged={setIngredientValueChanged}
                //handleClose ={handleClose}
            />
        {/* <ModalCLoseLineDialog mode="closeModalLineDialog" open={openedModalCloseLineDialog === "closeModalLineDialog"}  closeModal={() => setOpenedModalCloseLineDialog(null)} handleCloseModalMain={handleCloseModalMain}/> */}
        </Dialog>

    )
}

export default AddLineDialog;
