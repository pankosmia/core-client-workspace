import {useState, useContext, useEffect} from "react";
import {Box, Stack} from "@mui/material";
import OBSContext from "../../contexts/obsContext";
import Markdown from 'react-markdown';

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
            let lines = response.text.split("\n\n"); // Récupérer suelement le texte et les images
            // Version 1 -> Décalé a cause du titre considéré comme premiere phrase du paragraphe
            // const index = (obs[1] - 1) * 2; // L'index d'un paragraphe
            // const ingredient = lines[index] ? lines[index] + '\n\n' + lines[index + 1] : lines[index]; 

            // Version 2 -> Titre tout seul
            const index = (obs[1]) * 2 - 1 < 0 ? 0 : (obs[1]) * 2 - 1;  // L'index d'un paragraphe
            const index2 = index === 0 ? undefined : index + 1;
            let ingredient = lines[index];
            if (index2 && index2 < lines.length) {
                ingredient += '\n\n' + lines[index2];
            }

            let imageName = `${obs[0] <= 9 ? `0${obs[0]}` : obs[0]}-${obs[1] <= 9 ? `0${obs[1]}` : obs[1]}`;
            const obsImageLink = `/burrito/ingredient/bytes/git.door43.org/uW/obs_images_360?ipath=360px/obs-en-${imageName}.jpg`
            ingredient = ingredient.replace(/!\[OBS Image\]\([^)]+\)/g, `![OBS Image not found](${obsImageLink})`);
            
            // Version 3 -> Le titre fait partie du premier paragraphe donc 3 lignes au premier paragraphe
            // const index = (obs[1] - 1) * 2 + 1; // L'index d'un paragraphe
            // let ingredient = "";
            // if (obs[1] === 1) {
            //     ingredient = lines[index] ? lines[index] + '\n\n' + lines[index + 1] + '\n\n' + lines[index + 2] : lines[index]; 
            // } else {
            //     ingredient = lines[index] ? lines[index] + '\n\n' + lines[index + 1] : lines[index];
            // }

            setIngredient(ingredient);
        }
    };
    
    useEffect(
        () => {
            getAllData().then();
        }, [obs]
    );

    return (
        <Stack sx={{ p:2}}>
            <div>
                <Markdown>
                    {ingredient}
                </Markdown>
            </div>
        </Stack>
    );
}

export default OBSViewerMuncher;
