import { useContext, useEffect, useState } from "react";
import { Box, Dialog, Grid2, IconButton, TextField, Typography } from "@mui/material";
import { postEmptyJson, bcvContext as BcvContext, } from "pithekos-lib";
import InfoIcon from '@mui/icons-material/Info';

function TranslationPlanViewerMuncher({ metadata }) {
    const [ingredient, setIngredient] = useState();
    const { systemBcv } = useContext(BcvContext);
    const [openDialogAbout, setOpenDialogAbout] = useState(false);

    const handleOpenDialogAbout = () => {
        setOpenDialogAbout(true);
    }
    const handleCloseDialogAbout = () => {
        setOpenDialogAbout(false);
    }

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

    async function loadCSS() {
        const url = "/app-resources/usfm/bible_page_styles.css";
        const response = await fetch(url);
        if (!response.ok) {
            console.error("Erreur de chargement du CSS :", response.status);
            return;
        }
        const cssText = await response.text();
        const style = document.createElement("style");
        style.textContent = cssText;
        document.head.appendChild(style);
    }

    useEffect(
        () => {
            getAllData().then();
            loadCSS();
        },
        []
    );
    console.log("systembcv", systemBcv);
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                gap: 2
            }}
        >
            {ingredient ? (
                <>
                    {ingredient.sections.map((section, index) => (
                        <Box sx={{
                            flex: 1,
                            borderBlockColor: 'secondary.main',
                            borderRadius: 2,
                            
                        }} key={index}
                        >
                            {section.bookCode === systemBcv.bookCode ? (
                                <>
                                    {ingredient.sections.map((section, sectionIdx) => (
                                        <Box key={sectionIdx}>
                                            {ingredient.sectionStructure.map((field, idx) => {
                                                const className = field.paraTag || "";
                                                if (field.type === "scripture") {
                                                    return (
                                                        <Box key={idx} mt={2}>
                                                            <Typography>{field.type}</Typography>
                                                        </Box>
                                                    );
                                                }

                                                const value =
                                                    section.fieldInitialValues?.[field.name] ??
                                                    ingredient.fieldInitialValues?.[field.name] ??
                                                    "";

                                                return (
                                                    <Typography className={className} fullWidth size="small" value={value || ''}> {value}</Typography>
                                                );
                                            })}
                                            {/* {ingredient.section.paragraphs.map()} */}
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
                    <IconButton onClick={() => {
                        handleOpenDialogAbout()
                    }}>
                        <InfoIcon />
                    </IconButton>
                    <Dialog
                        open={openDialogAbout}
                        onClose={handleCloseDialogAbout}
                    >
                        <Box sx={{
                            flex: 1,
                            borderBlockColor: 'primary.main',
                            borderRadius: 2,
                            margin: 1,
                            padding: 1
                        }}>
                            <Typography>About </Typography>
                            {Object.entries(ingredient).map(([key, value]) => {
                                if (key === "sectionStructure" | key === "sections" | key === "fieldInitialValues") return null;
                                return (
                                    <Box key={key} mb={2}>
                                        <Typography fullWidth size="small" value={value || ''}> {value}</Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Dialog>

                </>

            ) : (<Typography>Chargement...</Typography>)
            }

        </Box >
    );
}

export default TranslationPlanViewerMuncher;
