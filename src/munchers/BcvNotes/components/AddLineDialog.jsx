import { useState, useContext, useEffect } from "react";
import {
  AppBar,
  IconButton,
  Toolbar,
  Typography,
  Button,
  Modal,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TsvLineForm from "./TsvLineForm";

import { i18nContext as I18nContext } from "pankosmia-rcl";
import { doI18n } from "pithekos-lib";

function AddLineDialog({
  open,
  closeModal,
  ingredient,
  setIngredient,
  currentRowN,
  cellValueChanged,
  setCellValueChanged,
  refDisabled,
  setRefDisabled,
  resourceType,
}) {
  const { i18nRef } = useContext(I18nContext);
  const [newCurrentRow, setNewCurrentRow] = useState(Array(7).fill("", 0, 7));

  // Permet de fermer la modal principale
  const handleCloseModalNewNote = () => {
    closeModal();
  };

  // Permet de sauvegarder la nouvelle note
  const handleSaveNewTsvRow = (rowN, newRow) => {
    const newIngredient = [...ingredient];
    newIngredient.splice(rowN, 0, newRow);
    setIngredient(newIngredient);
    closeModal();
  };

  return (
    <Modal
      open={open}
      onClose={handleCloseModalNewNote}
      sx={{
        backdropFilter: "blur(3px)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxHeight: "80vh",
          maxWidth: "80vw",
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          overflow: "auto",
        }}
      >
        <AppBar
          color="secondary"
          sx={{
            position: "relative",
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleCloseModalNewNote}
              aria-label={doI18n(
                "pages:core-local-workspace:close",
                i18nRef.current,
              )}
            >
              <CloseIcon />
              <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                {doI18n(
                  `pages:core-local-workspace:${!resourceType.includes("note") ? "new_bcv_question" : resourceType}`,
                  i18nRef.current,
                )}
              </Typography>
            </IconButton>
            <Button
              autoFocus
              color="inherit"
              disabled={!cellValueChanged}
              onClick={() => {
                handleSaveNewTsvRow(currentRowN, newCurrentRow);
                setCellValueChanged(false);
              }}
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
          refDisabled={refDisabled}
          setRefDisabled={setRefDisabled}
        />
      </Box>
    </Modal>
  );
}

export default AddLineDialog;
