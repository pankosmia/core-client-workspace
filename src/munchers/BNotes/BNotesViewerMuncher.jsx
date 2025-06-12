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

function BNotesViewerMuncher({metadata}) {
    const [ingredient, setIngredient] = useState("");
    const {systemBcv} = useContext(BcvContext);
    const {debugRef} = useContext(DebugContext);
    const {i18nRef} = useContext(I18nContext);

    const getAllData = async () => {
        const ingredientLink = `/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.md`;
        let response = await getText(ingredientLink, debugRef.current);
        if (response.ok) {
            setIngredient(
                response.text
            );
        } else {
            setIngredient("")
        }
    };

    useEffect(
        () => {
            getAllData().then();
        },
        [systemBcv]
    );

    return (
        <Box>
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
