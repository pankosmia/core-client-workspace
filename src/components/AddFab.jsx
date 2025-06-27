import {useState} from "react";
import {Box, Fab} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AddLineDialog from "./AddLineDialog";

function AddFab({currentRowN, setCurrentRowN, ingredient, setIngredient}) {

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
                sx={{ml: 2}}
            >
                <AddIcon sx={{mr: 1}}/>
                Add
            </Fab>

            <AddLineDialog
                open={openedModal === 'add'}
                mode="add"
                closeModal={() => setOpenedModal(null)}
                currentRowN={currentRowN}
                setCurrentRowN={setCurrentRowN}
                ingredient={ingredient}
                setIngredient={setIngredient}
            />
        </Box>

    );
}

export default AddFab;
