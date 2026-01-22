import {useEffect, useState, useContext} from "react";
import {Box} from "@mui/material";
import Markdown from 'react-markdown';

import {
    i18nContext as I18nContext,
    debugContext as DebugContext,
    bcvContext as BcvContext,
    doI18n,
    getText
} from "pithekos-lib";

import TextDir from '../helpers/TextDir';

function BNotesViewerMuncher({metadata}) {
    const [ingredient, setIngredient] = useState("");
    const [textDir, setTextDir] = useState(metadata.script_direction.toLowerCase());
    
    const {systemBcv} = useContext(BcvContext);
    const {debugRef} = useContext(DebugContext);
    const {i18nRef} = useContext(I18nContext);

    const sbScriptDir = metadata.script_direction.toLowerCase();
    const sbScriptDirSet = sbScriptDir === 'ltr' || sbScriptDir === 'rtl';

    const getAllData = async () => {
        const ingredientLink = `/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.md`;
        let response = await getText(ingredientLink, debugRef.current);
        if (response.ok) {
            setIngredient(
                response.text
            );
            if (!sbScriptDirSet) {
                const dir = await TextDir(response.text, 'md');
                setTextDir(dir);
            }
        } else {
            setIngredient("")
        }
    };

    useEffect(
        () => {
            getAllData().then();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [systemBcv]
    );

    // If SB does not specify direction then it is set here, otherwise it has already been set per SB in WorkspaceCard
    return (
        <Box dir={!sbScriptDirSet ? textDir : undefined}>
            <h5>{`${metadata.name} (${systemBcv.bookCode})`}</h5>
            <h6>{doI18n("munchers:b_notes_viewer:title", i18nRef.current)}</h6>
            <div>
                {
                    ingredient.length > 0 ?
                        <Markdown>{
                            ingredient
                        }</Markdown> :
                        "No notes found for this book"
                }
            </div>
        </Box>
    );
}

export default BNotesViewerMuncher;
