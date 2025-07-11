import { useState, useContext, useEffect } from "react";
import { Box, Button, Grid2, Stack, TextareaAutosize } from "@mui/material";
import OBSContext from "../../contexts/obsContext";
import Markdown from 'react-markdown';
import OBSNavigator from "../../components/OBSNavigator";
import SaveOBSButton from "../../components/SaveOBSButton";

import {
    i18nContext as I18nContext,
    debugContext as DebugContext,
    bcvContext as BcvContext,
    doI18n,
    getText
} from "pithekos-lib";




function OBSEditorMuncher({ metadata }) {
    const { obs, setObs } = useContext(OBSContext);
    const { debugRef } = useContext(DebugContext);
    const { i18nRef } = useContext(I18nContext);
    const [ingredient, setIngredient] = useState("");
    const [ingredientList, setIngredientList] = useState([]);


    const getData = async () => {
        if (obs[0] < 0) obs[0] = 0;
        if (obs[0] > 50) obs[0] = 50;
    };

    const initIngredientList = async () => {
        // if (ingredientList.length !== 0) return;
        if (obs[0] < 0) obs[0] = 0;
        if (obs[0] > 50) obs[0] = 50;
        let fileName = obs[0] <= 9 ? `0${obs[0]}` : obs[0];
        const ingredientLink = `/burrito/ingredient/raw/${metadata.local_path}?ipath=content/${fileName}.md`;
        let response = await getText(ingredientLink, debugRef.current);
        if (response.ok) {
            setIngredientList(response.text.split("\n\n").filter((_, index) => index % 2 === 0)); // Lignes paires
        }
    }

    const handleChange = (event) => {
        let newIngredientList = [...ingredientList];
        newIngredientList[obs[1]] = event.target.value.replaceAll(/\s/g, " ");
        setIngredientList(newIngredientList);
        console.log(event.target.value);
    }


    useEffect(
        () => {
            initIngredientList().then();
        }, [obs[0]]
    );

    useEffect(
        () => {
            getData().then();
        },
        [obs[1]]
    );

    return (
        <Stack sx={{ p: 2 }}>
            <OBSNavigator max={ingredientList.length - 1} />
            <Stack>
                <TextareaAutosize
                    value={ingredientList[obs[1]]}
                    id="standard-basic"
                    metadata={metadata}
                    onChange={handleChange}
                    style={{
                        boxSizing: "border-box",
                        fontSize: "0.875rem",
                        fontWeight: 400,
                        lineHeight: 1.5,
                        padding: "8px 12px",
                        borderRadius: 8,
                        color: "#1c2025",
                        border: "1px solid #b6daff",
                        boxShadow: "0 2px 2px #F3F6F9",
                    }}
                />
                <SaveOBSButton obs={obs} ingredientList={ingredientList} metadata={metadata} debugRef={debugRef} />
            </Stack>
        </Stack>
    );
}

export default OBSEditorMuncher;
