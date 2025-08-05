import { useState, useContext, useEffect } from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import OBSContext from "../../contexts/obsContext";
import OBSNavigator from "../../components/OBSNavigator";
import SaveOBSButton from "../../components/SaveOBSButton";
import AudioRecorder from "../../components/AudioRecorder";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import MarkdownField from "../../components/MarkdownField";

import "./OBSMuncher.css";

import {
    debugContext as DebugContext,
    getText,
    postText
} from "pithekos-lib";
import md5 from "md5";
import Switch from "@mui/material/Switch";


function OBSEditorMuncher({ metadata }) {
    const { obs, setObs } = useContext(OBSContext);
    const { debugRef } = useContext(DebugContext);
    const [ingredient, setIngredient] = useState([]); 
    const [audioUrl, setAudioUrl] = useState("");
    const [ checksums, setChecksums] = useState({});
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [chapterChecksums, setChapterChecksums] = useState([]);

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
            const chapterContent = response.text.split(/\n\r?\n\r?/).filter((_, index) => index % 2 === 0); // Lignes paires
            setIngredient(prevIngredient => {
                const newIngredient = [...prevIngredient];
                newIngredient[obs[0]] = chapterContent;
                return newIngredient;
            });
            for (let i = 0; i < chapterContent.length; i++) {
                initChecksums(obs[0], i, chapterContent[i]);
            }
            const newChapterChecksums = [...chapterChecksums];
            newChapterChecksums[obs[0]] = calculateChapterChecksum(chapterContent);
            setChapterChecksums(newChapterChecksums);
        }
        // console.log(`Chapter Checksums: ${chapterChecksums}`);
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
    }

    /* Vérification des sauvegardes */
    const calculateChapterChecksum = (chapter) => {
        if (!chapter) return 0;
        let checksum = 0;
        for (let i = 0; i < chapter.length; i++) {
            checksum += md5(chapter[i]);
        }
        // console.log(`Chapter Checksum: ${checksum} for ${chapter} `);
        return checksum;
    }

    const initChecksums = (chapterIndex, paragraphIndex, content) => {
        const key = `${chapterIndex}-${paragraphIndex}`;
        const checksum = md5(content);
        // console.log(`Key: ${key}, Checksum: ${checksum}`);
        setChecksums(prev => ({ ...prev, [key]: checksum }));
    };

    const isModified = () => {
        const chapterIndex = obs[0];
        const originalChecksum = chapterChecksums[chapterIndex];
        if (!originalChecksum) {
            return false;
        }
        const currentChecksum = calculateChapterChecksum(ingredient[chapterIndex]);
        // console.log(`Comparaison: ${originalChecksum} !== ${currentChecksum} ${originalChecksum !== currentChecksum}`);
        // console.log(`Content: ${ingredient[chapterIndex]}`);
        
        return originalChecksum !== currentChecksum;
    };
    const updateChecksums = (chapterIndex) => {
        const chapter = ingredient[chapterIndex];
        if (!chapter) return;
        
        setChecksums(prev => {
            const newChecksums = { ...prev };
            chapter.forEach((content, paragraphIndex) => {
                const key = `${chapterIndex}-${paragraphIndex}`;
                newChecksums[key] = md5(content);
            });
            return newChecksums;
        });

        setChapterChecksums(prev => {
            const newChapterChecksums = [...prev];
            newChapterChecksums[chapterIndex] = calculateChapterChecksum(chapter);
            return newChapterChecksums;
        });
    };

    /* Systeme de sauvegarde */
    const handleSaveOBS = async () => {
        if (!ingredient || ingredient.length == 0) return;
        
        for (let i = 0; i < ingredient.length; i++) {
            if (!ingredient[i] || ingredient[i].length == 0) continue;
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
            return response.text.split(/\n\r?\n\r?/).map((line, index) => {
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
    

    /* Gestion de l'audio */
    function AudioViewer({chapter, paragraph}) {
        let chapterString = chapter < 10 ? `0${chapter}` : chapter;
        let paragraphString = paragraph < 10 ? `0${paragraph}` : paragraph;

        // A faire: Faire en sorte d'afficher un message si le fichier n'existe pas

        // if (!paragraph) {
        //     return <audio controls src={`/burrito/ingredient/bytes/${metadata.local_path}?ipath=content/${chapterString}.mp3`}></audio>
        // }
        // return <Stack>
        //         <audio controls src={`/burrito/ingredient/bytes/${metadata.local_path}?ipath=content/${chapterString}_${paragraphString}.mp3`}></audio>
        // </Stack>
    }

    const currentChapter = ingredient[obs[0]] || [];

    useEffect(
        () => {
            handleSaveOBS();
            initIngredient().then();
        }, [obs[0]]
    );
    
    useEffect(() => {
        const onBeforeUnload = ev => {
            console.log("isDocModified", isModified());

            if (isModified()) {
                ev.preventDefault();
            }
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () =>{
            window.removeEventListener('beforeunload', onBeforeUnload);
        }
    }, [isModified()]);

    return (
        <Stack sx={{ p: 2 }}>
            <OBSNavigator max={currentChapter.length - 1} />
            <Box>
                Audio: <Switch checked={audioEnabled} onChange={() => setAudioEnabled(!audioEnabled)} />
            </Box>
            <Stack>
                <MarkdownField currentRow={obs[1]} columnNames={currentChapter} onChangeNote={handleChange} value={currentChapter[obs[1]] || ""} mode="write"/>
                {audioEnabled && <AudioRecorder audioUrl={audioUrl} setAudioUrl={setAudioUrl} metadata={metadata} obs={obs}/>}
                <SaveOBSButton obs={obs} isModified={isModified} handleSave={handleSaveOBS} />
            </Stack>
        </Stack>
    );
}

export default OBSEditorMuncher;
