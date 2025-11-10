import { useContext, useEffect, useState } from "react";
import { Box, Grid2, TextField, Typography } from "@mui/material";
import { postEmptyJson, bcvContext as BcvContext, } from "pithekos-lib";

function TranslationPlanViewerMuncher({ metadata }) {
    const [ingredient, setIngredient] = useState();
    const { systemBcv } = useContext(BcvContext);
    const getAllData = async () => {
        const ingredientLink = `/burrito/ingredient/raw/${metadata.local_path}?ipath=plan.json`;
        const response = await fetch(ingredientLink);

        if (response.ok) {
            const data = await response.json();
            setIngredient(data);
        } else {
            setIngredient([]);
        }
    };

    useEffect(
        () => {
            getAllData().then();
        },
        []
    );
    const section = ingredient.sections[0];


    const enrichedSectionStructure = ingredient.sectionStructure.map(item => {

        const value = section.fieldInitialValues[item.name] || ingredient.fieldInitialValues[item.name] || "";

        return {
            ...item,
            value,
            bookCode: section.bookCode
        };
    });

    console.log(ingredient);
    return (
        <Box>
            {ingredient ? (
                <>
                    <Typography>About </Typography>
                    {Object.entries(ingredient).map(([key, value]) => {
                        if (key === "sectionStructure" | key === "sections" | key === "fieldInitialValues") return null;
                        return (
                            <Box key={key} mb={2}>
                                <Typography fullWidth size="small" value={value || ''}> {value}</Typography>
                            </Box>
                        );
                    })}

                    <Typography>{systemBcv.bookCode}</Typography>
                    <pre >
                        {JSON.stringify(ingredient, null, 2)}
                    </pre>
                    {ingredient.sections.map((section, index) => (
                        <Box key={index} mb={2} p={1}>
                            {section.bookCode === systemBcv.bookCode ? (
                                <>
                                    <Typography color="success.main">
                                        Livre trouvé : {section.bookCode}
                                    </Typography>
                                    {ingredient.sectionStructure.map((item, idx) => (
                                        <Box key={idx} mb={2} p={1}>
                                            <TextField
                                                label={item.paraTag}
                                                fullWidth
                                                size="small"
                                              value={ingredient.fieldInitialValues[item.name] || ""}
                                                sx={{ mt: 1 }}
                                            />
                                        </Box>
                                    ))}
                                </>
                            ) : (
                                <Typography color="error.main">
                                    Aucun livre pour ce chapitre
                                </Typography>
                            )}
                        </Box>
                    ))}

                </>

            ) : (<Typography>Chargement...</Typography>)
            }

        </Box >
    );
}

export default TranslationPlanViewerMuncher;
