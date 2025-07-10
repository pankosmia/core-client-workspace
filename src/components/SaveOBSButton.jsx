import { useContext, useState } from "react";
import {
} from "pithekos-lib";
import { enqueueSnackbar } from "notistack";
import { Button, IconButton } from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import { postText, doI18n, getText } from "pithekos-lib";


function SaveOBSButton({ obs, ingredientList, metadata, debugRef}) {

    const handleSaveOBS = () => {
        if (ingredientList.length == 0) return;
        if(obs[0] < 1) obs[0] = 1;
        if(obs[0] > 50) obs[0] = 50;
        uploadOBSIngredient(ingredientList);
    }
    
    const uploadOBSIngredient = async (ingredientList) => {
        let fileName = obs[0] <= 9 ? `0${obs[0]}` : obs[0];
        const obsString = await getStringifyIngredient(ingredientList, fileName);
        const payload = JSON.stringify({ payload: obsString });
        console.log(payload)
        const response = await postText(
            `/burrito/ingredient/raw/${metadata.local_path}?ipath=content/${fileName}.md`,
            payload,
            debugRef,
            "application/json"
        );
        if (response.ok) {
            console.log("Saved");
        } else {
            console.log("Failed to save");
            throw new Error(`Failed to save: ${response.status}, ${response.error}`);
        }
    }

    const getStringifyIngredient = async ( ingredientList, fileName) => {
        const response = await getText(
            `/burrito/ingredient/raw/${metadata.local_path}?ipath=content/${fileName}.md`,
            debugRef
        );
        if (response.ok) {
            return response.text.split("\n\n").map((line, index) => {
                if (index % 2 === 1) {
                    return line.replaceAll(/\n/g, " ");
                } else {
                    return ingredientList[index / 2];
                }
            }).join("\n\n");
        } else {
            return "";
        }
    }

    return (
        <IconButton onClick={handleSaveOBS}>
            <SaveIcon />
        </IconButton>
    )


}
export default SaveOBSButton;