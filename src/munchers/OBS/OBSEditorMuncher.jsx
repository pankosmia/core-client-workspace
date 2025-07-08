import {useState, useContext, useEffect} from "react";
import {Box, Button, Grid2, Stack, TextareaAutosize} from "@mui/material";
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



        
function OBSEditorMuncher({metadata}) {
    const {obs, setObs} = useContext(OBSContext);
    const {debugRef} = useContext(DebugContext);
    const {i18nRef} = useContext(I18nContext);
    const [ingredient, setIngredient] = useState("");
    const [ingredientList, setIngredientList] = useState([]);


    const getData = async () => {
        if(obs[0] < 1) obs[0] = 1;
        if(obs[0] > 50) obs[0] = 50;
    };

    const initIngredientList = async () => {
        // if (ingredientList.length !== 0) return;
        if(obs[0] < 1) obs[0] = 1;
        if(obs[0] > 50) obs[0] = 50;
        let fileName = obs[0] <= 9 ? `0${obs[0]}` : obs[0];
        const ingredientLink = `/burrito/ingredient/raw/${metadata.local_path}?ipath=content/${fileName}.md`;
        let response = await getText(ingredientLink, debugRef.current);
        if (response.ok) {
            setIngredientList(response.text.split("\n\n").filter((_, index) => index % 2 === 0)); // Lignes impaires
        }
    }

    const handleChange = (event) => {
        let newIngredientList = [...ingredientList];
        newIngredientList[obs[1]-1] = event.target.value;
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
        <Box>
            <OBSNavigator />
            <Box>
                <SaveOBSButton obs={obs} ingredientList={ingredientList} metadata={metadata} debugRef={debugRef}/>
                <TextareaAutosize  value={ingredientList[obs[1]-1]} id="standard-basic" variant="standard" metadata={metadata} onChange={handleChange}/>
            </Box>
        </Box>
    );
}

export default OBSEditorMuncher;
