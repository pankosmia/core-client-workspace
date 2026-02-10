import { useState, useContext } from "react";
import { Box, Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AddLineDialog from "./AddLineDialog";

import { i18nContext as I18nContext } from "pankosmia-rcl";
import { doI18n } from "pithekos-lib";
function AddFab({
  currentRowN,
  setCurrentRowN,
  ingredient,
  setIngredient,
  cellValueChanged,
  setCellValueChanged,
}) {
  const { i18nRef } = useContext(I18nContext);
  const [openedModal, setOpenedModal] = useState(null);

  const handleCreateForm = () => {
    setOpenedModal("add");
  };

  return (
    <Box>
      <Fab
        variant="extended"
        color="primary"
        size="small"
        onClick={(event) => {
          handleCreateForm();
        }}
        sx={{ ml: 2 }}
      >
        <AddIcon sx={{ mr: 1 }} />
        {doI18n("pages:core-local-workspace:add", i18nRef.current)}
      </Fab>

      <AddLineDialog
        mode="add"
        open={openedModal === "add"}
        closeModal={() => setOpenedModal(null)}
        currentRowN={currentRowN}
        setCurrentRowN={setCurrentRowN}
        ingredient={ingredient}
        setIngredient={setIngredient}
        cellValueChanged={cellValueChanged}
        setCellValueChanged={setCellValueChanged}
      />
    </Box>
  );
}

export default AddFab;
