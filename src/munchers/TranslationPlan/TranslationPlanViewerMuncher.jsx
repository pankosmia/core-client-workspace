import { useEffect, useState, useContext } from "react";
import { Box, Grid2, Typography, Accordion, AccordionSummary, AccordionDetails, Card, CardContent } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Markdown from 'react-markdown';
import OBSContext from "../../contexts/obsContext";

import {
    i18nContext as I18nContext,
    debugContext as DebugContext,
    doI18n,
    getText
} from "pithekos-lib";

function TranslationPlanViewerMuncher({ metadata }) {
    const [ingredient, setIngredient] = useState([]);
    const { obs } = useContext(OBSContext);
    const { debugRef } = useContext(DebugContext);
    const { i18nRef } = useContext(I18nContext);


    const getAllData = async () => {
        const ingredientLink = `/burrito/ingredient/raw/${metadata.local_path}?ipath=plan.json`;
        let response = await getText(ingredientLink, debugRef.current);
        if (response.ok) {
            setIngredient(
                response.text
                .split("\n")
                .map(l => l.split("\t").map(f => f.replace(/\\n/g, "\n\n")))
            );
        } else {
            setIngredient([])
        }
    };
    console.log("ingredientLink",ingredient)
    
    useEffect(
        () => {
            getAllData().then();
        },
        [obs]
    );


    return (
        <Box sx={{ flexGrow: 1 }}>
            <Grid2
                container
                direction="row"
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                <Grid2
                    item
                    size={3}
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    <Typography variant="subtitle1">{`(${obs[0]}:${obs[1]})`}</Typography>
                </Grid2>
                <Grid2 item size={12}>
                    
                </Grid2>
            </Grid2>
        </Box>
    );
}

export default TranslationPlanViewerMuncher;
