import { useState, useContext, useEffect } from "react";
import { AppBar, Dialog, IconButton, Toolbar, Typography, Button, Modal, Box } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import TsvLineForm from "./TsvLineForm";

import { i18nContext as I18nContext } from "pankosmia-rcl";
import { doI18n } from "pithekos-lib";
import { v4 as uuidv4 } from 'uuid';

function AddLineDialog({ open, closeModal, ingredient, setIngredient, currentRowN, cellValueChanged, setCellValueChanged }) {
    const { i18nRef } = useContext(I18nContext);
    const [newCurrentRow, setNewCurrentRow] = useState(Array(7).fill("", 0, 7));
    const [resourceType, setResourceType] = useState("new_bcv_note");

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
            // Change i18n depending on what resource we got
            if (ingredient[0].some(c => c.includes('Response'))) setResourceType("new_bcv_question");
            else if (ingredient[0].some(c => c.includes('Question'))) setResourceType("new_bcv_study_question");
        }
    }, [ingredient]);

    return (
        <Modal
            open={open}
            onClose={handleCloseModalNewNote}
            sx={{
                backdropFilter: "blur(3px)",
            }}
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                maxHeight: "80vh",
                maxWidth: "80vw",
                bgcolor: 'background.paper',
                boxShadow: 24,
                borderRadius: 2,
                overflow: "auto",
            }}>
                <AppBar color="secondary" sx={{ position: 'relative', borderTopLeftRadius: 4, borderTopRightRadius: 4 }}>
                    <Toolbar sx={{ justifyContent: "space-between" }}>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={handleCloseModalNewNote}
                            aria-label={doI18n("pages:core-local-workspace:close", i18nRef.current)}
                        >
                            <CloseIcon />
                            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                                {doI18n(`pages:core-local-workspace:${!resourceType.includes("note") ? "new_bcv_question" : resourceType}`, i18nRef.current)}
                            </Typography>
                        </IconButton>
                        <Button
                            autoFocus
                            color="inherit"
                            disabled={!cellValueChanged}
                            onClick={() => { handleSaveNewTsvRow(currentRowN, newCurrentRow); setCellValueChanged(false) }}
                        >
                            {doI18n("pages:core-local-workspace:create", i18nRef.current)}
                        </Button>
                    </Toolbar>
                </AppBar>
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
                    resourceType={resourceType}
                />
            </Box>

        </Modal>

    )
}

export default AddLineDialog;