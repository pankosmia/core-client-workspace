import { useState } from "react";
import { Box, Fab, Menu, MenuItem } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditorLines from "./EditorLines";

function AddLine() {
    const [openedModal, setOpenedModal] = useState(null);
    const [createAnchorEl, setCreateAnchorEl] = useState(null);

    const handleCreateForm = () => {
        setOpenedModal("new-form");
        setCreateAnchorEl(null);
    };

    const handleCreateClose = () => {
        setCreateAnchorEl(null);
    };
    return (
        <>
            <Box>
                <Fab
                    variant="extended"
                    color="primary"
                    size="small"
                    onClick={event => setCreateAnchorEl(event.currentTarget)}
                    sx={{ ml: 2 }}
                >
                    <AddIcon sx={{ mr: 1 }} onClick={handleCreateForm} />
                </Fab>
                <Menu
                    anchorEl={createAnchorEl}
                    open={!!createAnchorEl}
                    onClose={handleCreateClose}
                >
                    <MenuItem
                        onClick={handleCreateForm}>
                    </MenuItem>

                </Menu>
                {/* <EditorLines open={openedModal === 'new-form'}
                    closeModal={() => setOpenedModal(null)} /> */}
            </Box>


        </>
    );
}

export default AddLine;
