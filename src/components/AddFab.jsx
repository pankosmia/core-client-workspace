import { useState } from "react";
import { Box, Fab, Menu, MenuItem } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AddLineDialog from "./AddLineDialog";

function AddFab({ currentRow, setCurrentRow, ingredient, setIngredient }) {

    const [openedModal, setOpenedModal] = useState(null);
    const [createAnchorEl, setCreateAnchorEl] = useState(null);

    const handleCreateForm = () => {
        setOpenedModal("editor");
        setCreateAnchorEl(null);
    };

    return (

        <Box>
            <Fab
                variant="extended"
                color="primary"
                size="small"
                onClick={(event) => {
                    setCreateAnchorEl(event.currentTarget);
                    handleCreateForm();
                }}
                sx={{ ml: 2 }}
            >
                <AddIcon sx={{ mr: 1 }} />
                Add
            </Fab>

            <AddLineDialog open={openedModal === 'editor'}
                closeModal={() => setOpenedModal(null)} currentRow={currentRow} mode="add" setCurrentRow={setCurrentRow} ingredient={ingredient} setIngredient={setIngredient} />
        </Box>

    );
}

export default AddFab;
