import { useState, useContext, useEffect } from "react";
import { Box, Button, Grid2, Stack, TextareaAutosize, Tabs, Tab } from "@mui/material";
import OBSContext from "../../contexts/obsContext";
import OBSNavigator from "../../components/OBSNavigator";
import SaveOBSButton from "../../components/SaveOBSButton";
import AudioRecorder from "../../components/AudioRecorder";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';

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
    const [audioFile, setAudioFile] = useState("");
    const [tab, setTab] = useState("text");
    const [isThereAnAudioFile, setIsThereAnAudioFile] = useState(false);


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

    function AudioViewer({chapter, paragraph}) {
        let chapterString = chapter < 10 ? `0${chapter}` : chapter;
        let paragraphString = paragraph < 10 ? `0${paragraph}` : paragraph;

        // A faire: Faire en sorte d'afficher un message si le fichier n'existe pas

        if (!paragraph) {
            return <audio controls src={`/burrito/ingredient/bytes/${metadata.local_path}?ipath=content/${chapterString}.mp3`}></audio>
        }
        return <Stack>
                <audio controls src={`/burrito/ingredient/bytes/${metadata.local_path}?ipath=content/${chapterString}_${paragraphString}.mp3`}></audio>
        </Stack>
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
            <Tabs value={tab} onChange={(event, newValue) => setTab(newValue)}>
                <Tab label="Text" value="text" iconPosition="end" icon={ ingredientList[obs[1]] != "" ? <CheckBoxOutlinedIcon /> : <CheckBoxOutlineBlankIcon />}/>
                <Tab label="Audio" value="audio" iconPosition="end" icon={isThereAnAudioFile ? <CheckBoxOutlinedIcon /> : <CheckBoxOutlineBlankIcon />}/>
            </Tabs>
            <Stack>
                {tab === "text" && (
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
                )}
                {tab === "audio" && (
                    <>
                        <AudioViewer chapter={obs[0]} paragraph={obs[1]} />
                        <AudioRecorder setAudioFile={setAudioFile} metadata={metadata} />
                    </>
                )}
                <SaveOBSButton obs={obs} ingredientList={ingredientList} metadata={metadata} debugRef={debugRef} audioFile={audioFile}/>
            </Stack>
        </Stack>
    );
}

export default OBSEditorMuncher;
