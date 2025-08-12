import { useState, useContext, useEffect } from "react";
import { AppBar, Dialog, IconButton, Toolbar, Typography, Button } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import TsvLineForm from "./TsvLineForm";
import {
    i18nContext as I18nContext,
    doI18n,
} from "pithekos-lib";
import { v4 as uuidv4 } from 'uuid';

function AddLineDialog({ open, closeModal, ingredient, setIngredient, currentRowN, cellValueChanged, setCellValueChanged }) {
    const { i18nRef } = useContext(I18nContext);
    const [newCurrentRow, setNewCurrentRow] = useState(Array(7).fill("", 0, 7));

    // Permet de fermer la modal principale 
    const handleCloseModalNewNote = () => {
        closeModal();
    }

    // Permet de sauvegarder la nouvelle note
    const handleSaveNewTsvRow = (rowN, newRow) => {
        const newIngredient = [...ingredient];
        newIngredient.splice(rowN, 0, newRow);
        setIngredient(newIngredient);
        closeModal();
    };

    useEffect(() => {
        const generateId = () => {
            let existingId = ingredient.map(l => l[1]);
            let myId = null;
            let found = false;
            while (!found) {
                myId = uuidv4().substring(0, 4);
                if (!existingId.includes(myId)) {
                    found = true;
                }
            }
            return myId;
        };

        if (ingredient.length > 0) {
            const newId = generateId();
            if (newCurrentRow[1] !== newId) {
                const newRowData = [...newCurrentRow];
                newRowData[1] = newId;
                setNewCurrentRow(newRowData);
            }
        }
    }, [ingredient]);


    return (
        <Dialog
            fullWidth={true}
            open={open}
            onClose={handleCloseModalNewNote}
            sx={{
                backdropFilter: "blur(3px)",
            }}
        >
            <AppBar color="secondary" sx={{ position: 'relative', borderTopLeftRadius: 4, borderTopRightRadius: 4}}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{color:"black" }}>
                        {doI18n("pages:core-local-workspace:new_bcv_note", i18nRef.current)}
                    </Typography>
                </Toolbar>
            </AppBar>
            <Typography variant='subtitile2' sx={{ ml: 1, p: 1 }}>{doI18n("pages:content:required_field", i18nRef.current)}</Typography>
            <TsvLineForm
                mode="add"
                currentRow={newCurrentRow}
                setCurrentRow={setNewCurrentRow}
                currentRowN={currentRowN}
                ingredient={ingredient}
                setIngredient={setIngredient}
                saveFunction={handleSaveNewTsvRow}
                handleCloseModalNewNote={handleCloseModalNewNote}
                cellValueChanged={cellValueChanged}
                setCellValueChanged={setCellValueChanged}
            />
            <DialogActions>
                <Button
                    onClick={handleCloseModalNewNote}
                    color="primary"
                >
                    {doI18n("pages:core-local-workspace:cancel", i18nRef.current)}
                </Button>
                <Button
                    autoFocus
                    variant="contained"
                    color="primary"
                    disabled={!cellValueChanged}
                    onClick={() => { handleSaveNewTsvRow(currentRowN, newCurrentRow); setCellValueChanged(false) }}
                >
                    {doI18n("pages:core-local-workspace:create", i18nRef.current)}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default AddLineDialog;
