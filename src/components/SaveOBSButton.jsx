import { useContext, useState } from "react";
import {
} from "pithekos-lib";
import { enqueueSnackbar } from "notistack";
import { Button, IconButton } from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import { postJson, doI18n } from "pithekos-lib";


function SaveOBSButton({ obs, ingredientList, metadata}) {

    const handleSaveOBS = () => {
        if (ingredientList.length == 0) return;
        if(obs[0] < 1) obs[0] = 1;
        if(obs[0] > 50) obs[0] = 50;
        uploadOBSIngredient(ingredientList);
    }
    
    const uploadOBSIngredient = async (obsData) => {
        const obsString = obsData
        const payload = JSON.stringify({ payload: obsString });
        let fileName = obs[0] <= 9 ? `0${obs[0]}` : obs[0];
        const response = await postJson(
            `/burrito/ingredient/raw/${metadata.local_path}?ipath=content/${fileName}.md`,
            payload,
        );
        if (response.ok) {
            console.log("Saved");
        } else {
            console.log("Failed to save");
            throw new Error(`Failed to save: ${response.status}, ${response.error}`);
        }
    }

    return (
        <IconButton onClick={handleSaveOBS}>
            <SaveIcon />
        </IconButton>
    )

}
export default SaveOBSButton;