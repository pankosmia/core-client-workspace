import {
} from "pithekos-lib";
import { IconButton } from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';


function SaveOBSButton({ obs, isModified, handleSave}) {
    return (
        <IconButton onClick={handleSave} disabled={!isModified(obs[0])}>
            <SaveIcon />
        </IconButton>
    )
}
export default SaveOBSButton;