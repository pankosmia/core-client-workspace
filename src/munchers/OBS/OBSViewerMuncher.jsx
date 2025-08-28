import {useState, useContext, useEffect} from "react";
import {Box, Stack} from "@mui/material";
import OBSContext from "../../contexts/obsContext";
import Markdown from 'react-markdown';
import RequireResources from "../../components/RequireResources";
import "./OBSMuncher.css";

import {
    i18nContext as I18nContext,
    debugContext as DebugContext,
    doI18n,
    getText
} from "pithekos-lib";
        
function OBSViewerMuncher({metadata}) {
    const {obs, setObs} = useContext(OBSContext);
    const {debugRef} = useContext(DebugContext);
    const {i18nRef} = useContext(I18nContext);
    const [ingredient, setIngredient] = useState("");

    const getAllData = async () => {
        let fileName = obs[0] <= 9 ? `0${obs[0]}` : obs[0];
        const ingredientLink = `/burrito/ingredient/raw/${metadata.local_path}?ipath=content/${fileName}.md`;
        let response = await getText(ingredientLink, debugRef.current);
        if (response.ok) {
            let lines = response.text.split(/\n\r?\n\r?/); // Récupérer seulement le texte et les images

            const index = (obs[1]) * 2 - 1 < 0 ? 0 : (obs[1]) * 2 - 1;  // L'index d'un paragraphe
            const index2 = index === 0 ? undefined : index + 1;
            let ingredient = lines[index];
            if (index2 && index2 < lines.length) {
                ingredient += '\n\n' + lines[index2];
            }

            let imageName = `${obs[0] <= 9 ? `0${obs[0]}` : obs[0]}-${obs[1] <= 9 ? `0${obs[1]}` : obs[1]}`;
            const obsImageLink = `/burrito/ingredient/bytes/git.door43.org/uW/obs_images_360?ipath=360px/obs-en-${imageName}.jpg`
            ingredient = ingredient.replace(/!\[OBS Image\]\([^)]+\)/g, `![OBS Image not found](${obsImageLink})`);


            setIngredient(ingredient);
        }
    };
    
    useEffect(
        () => {
            getAllData().then();
        }, [obs]
    );

    const contentSpec = {
        "general": {
            "obsimg360": {
                "_all": {
                    "dcs": {
                        "name": "OBS Images 360 (OBSIMG360)",
                        "repoPath": "git.door43.org/uW/obs_images_360"
                    }
                }
            }
        }
    }

    return (
        <RequireResources contentSpec={contentSpec}>
            <Stack sx={{ p:1}}>
                <div>
                    <Markdown className="markdown-content">
                        {ingredient}
                    </Markdown>
                </div>
            </Stack>
        </RequireResources>
    );
}

export default OBSViewerMuncher;
