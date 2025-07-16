import { useContext, useState } from "react";
import {
} from "pithekos-lib";
import { enqueueSnackbar } from "notistack";
import { Button, IconButton } from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import { postText, doI18n, getText } from "pithekos-lib";


function SaveOBSButton({ obs, ingredient, metadata, debugRef, updateChecksums, isDocumentModified}) {

    const handleSaveOBS = async () => {
        console.log("ingredient", ingredient);
        if (!ingredient || ingredient.length == 0) return;
        
        for (let i = 0; i < ingredient.length; i++) {
            if (!ingredient[i] || ingredient[i].length == 0) continue;
            console.log("ingredient[i]", ingredient[i]);
            console.log("Index: ", i);
            await uploadOBSIngredient(ingredient[i], i);
        }
    }
    
    const uploadOBSIngredient = async (ingredientItem, i) => {
        let fileName = (i) <= 9 ? `0${i}` : (i);
        const obsString = await getStringifyIngredient(ingredientItem, fileName);
        const payload = JSON.stringify({ payload: obsString });
        console.log(payload)
        const response = await postText(
            `/burrito/ingredient/raw/${metadata.local_path}?ipath=content/${fileName}.md`,
            payload,
            debugRef,
            "application/json"
        );
        if (response.ok) {
            console.log(`Saved file ${fileName}`);
            updateChecksums(i);
        } else {
            console.log(`Failed to save file ${fileName}`);
            throw new Error(`Failed to save file ${fileName}: ${response.status}, ${response.error}`);
        }
    }

    const getStringifyIngredient = async (ingredientItem, fileName) => {
        const response = await getText(
            `/burrito/ingredient/raw/${metadata.local_path}?ipath=content/${fileName}.md`,
            debugRef
        );
        if (response.ok) {
            return response.text.split("\n\n").map((line, index) => {
                if (index % 2 === 1) {
                    return line.replaceAll(/\n/g, " ");
                } else {
                    return ingredientItem[index / 2];
                }
            }).join("\n\n");
        } else {
            return "";
        }
    }

    return (
        <IconButton onClick={handleSaveOBS} disabled={!isDocumentModified}>
            <SaveIcon />
        </IconButton>
    )


}
export default SaveOBSButton;