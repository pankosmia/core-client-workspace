import { useState, useContext, useEffect } from "react";
import { Box, Button, Grid2, Stack, TextareaAutosize, Tabs, Tab } from "@mui/material";
import OBSContext from "../../contexts/obsContext";
import OBSNavigator from "../../components/OBSNavigator";
import SaveOBSButton from "../../components/SaveOBSButton";
import AudioRecorder from "../../components/AudioRecorder";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import MarkdownField from "../../components/MarkdownField";
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
    const [ingredient, setIngredient] = useState([]); 
    const [audioFile, setAudioFile] = useState("");
    const [tab, setTab] = useState("text");
    const [isThereAnAudioFile, setIsThereAnAudioFile] = useState(false);
    const [ checksums, setChecksums] = useState({});
    const [isDocumentModified, setIsDocumentModified] = useState(false);

    /* Données de l'ingredient */
    const initIngredient = async () => {
        if (obs[0] < 0) obs[0] = 0;
        if (obs[0] > 50) obs[0] = 50;
        if (ingredient[obs[0]]) {
            return; 
        }
        let fileName = obs[0] <= 9 ? `0${obs[0]}` : obs[0];
        const ingredientLink = `/burrito/ingredient/raw/${metadata.local_path}?ipath=content/${fileName}.md`;
        let response = await getText(ingredientLink, debugRef.current);
        if (response.ok) {
            const chapterContent = response.text.split("\n\n").filter((_, index) => index % 2 === 0); // Lignes paires
            setIngredient(prevIngredient => {
                const newIngredient = [...prevIngredient];
                newIngredient[obs[0]] = chapterContent;
                return newIngredient;
            });
            initChecksums(obs[0], obs[1], chapterContent[obs[1]]);
        }
    }
    const handleChange = (event) => {
        setIngredient(prevIngredient => {
            const newIngredient = [...prevIngredient];
            if (!newIngredient[obs[0]]) {
                newIngredient[obs[0]] = [];
            }
            newIngredient[obs[0]] = [...newIngredient[obs[0]]];
            newIngredient[obs[0]][obs[1]] = event.target.value.replaceAll(/\s/g, " ");
            return newIngredient;
        });
        const isDocModified = isModified(obs[0], obs[1], event.target.value);
        console.log("isDocModified", isDocModified);
        if (isDocModified) { setIsDocumentModified(true); }
        console.log(event.target.value);
    }

    /* Vérification des sauvegardes */
    const calculateChecksum = (content) => {
        let hash = 0;
        if (!content) return hash;
        for (let i = 0; i < content.length; i++) {
            hash = ((hash << 5) - hash) + content.charCodeAt(i);
            hash |= 0; // Constrain to 32-bit integer
        }
        return hash;
    };
    const initChecksums = (chapterIndex, paragraphIndex, content) => {
        const key = `${chapterIndex}-${paragraphIndex}`;
        const checksum = calculateChecksum(content);
        setChecksums(prev => ({ ...prev, [key]: checksum }));
    };
    const isModified = (chapterIndex, paragraphIndex, currentContent) => {
        console.log("isModified", chapterIndex, paragraphIndex, currentContent);
        const key = `${chapterIndex}-${paragraphIndex}`;
        const originalChecksum = checksums[key];
        if (!originalChecksum) {
            return false;
        }
        const currentChecksum = calculateChecksum(currentContent);
        console.log("isModified", originalChecksum, currentChecksum, originalChecksum !== currentChecksum);
        console.log("Content", currentContent, "Original", checksums[key]);
        return originalChecksum !== currentChecksum;
    };
    const updateChecksums = (chapterIndex) => {
        const chapter = ingredient[chapterIndex];
        if (!chapter) return;
        
        setChecksums(prev => {
            const newChecksums = { ...prev };
            chapter.forEach((content, paragraphIndex) => {
                const key = `${chapterIndex}-${paragraphIndex}`;
                newChecksums[key] = calculateChecksum(content);
            });
            return newChecksums;
        });
        setIsDocumentModified(false);
    };

    /* Gestion de l'audio */
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

    const currentChapter = ingredient[obs[0]] || [];

    useEffect(
        () => {
            initIngredient().then();
        }, [obs[0]]
    );

    return (
        <Stack sx={{ p: 2 }}>
            <OBSNavigator max={currentChapter.length - 1} />
            <Tabs value={tab} onChange={(event, newValue) => setTab(newValue)}>
                <Tab label="Text" value="text" iconPosition="end" icon={ currentChapter[obs[1]] && currentChapter[obs[1]] !== "" ? <CheckBoxOutlinedIcon /> : <CheckBoxOutlineBlankIcon />}/>
                <Tab label="Audio" value="audio" iconPosition="end" icon={isThereAnAudioFile ? <CheckBoxOutlinedIcon /> : <CheckBoxOutlineBlankIcon />}/>
            </Tabs>
            <Stack>
                {tab === "text" && (
                    <MarkdownField currentRow={obs[1]} columnNames={currentChapter} onChangeNote={handleChange} value={currentChapter[obs[1]] || ""} mode="write"/>
                )}
                {tab === "audio" && (
                    <>
                        <AudioViewer chapter={obs[0]} paragraph={obs[1]} />
                        <AudioRecorder setAudioFile={setAudioFile} metadata={metadata} />
                    </>
                )}
                <SaveOBSButton obs={obs} ingredient={ingredient} metadata={metadata} debugRef={debugRef} audioFile={audioFile} updateChecksums={updateChecksums} isDocumentModified={isDocumentModified}/>
            </Stack>
        </Stack>
    );
}

export default OBSEditorMuncher;
