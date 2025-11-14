import { useContext, useEffect, useState } from "react";
import { Box, Dialog, FormControl, Grid2, IconButton, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { postEmptyJson, bcvContext as BcvContext, getText, debugContext, i18nContext, doI18n, getJson, } from "pithekos-lib";
import InfoIcon from '@mui/icons-material/Info';
import { Proskomma } from "proskomma-core";

function TranslationPlanViewerMuncher({ metadata }) {
    const [ingredient, setIngredient] = useState();
    const { i18nRef } = useContext(i18nContext);
    const { systemBcv } = useContext(BcvContext);
    const [openDialogAbout, setOpenDialogAbout] = useState(false);
    const { debugRef } = useContext(debugContext);
    const [verseText, setVerseText] = useState([]);
    const [burritos, setBurritos] = useState([]);
    const [selectedBurrito, setSelectedBurrito] = useState(null);

    const handleOpenDialogAbout = () => {
        setOpenDialogAbout(true);
    }
    const handleCloseDialogAbout = () => {
        setOpenDialogAbout(false);
    }
    useEffect(
        () => {
            const getVerseText = async () => {
                if (selectedBurrito) {
                    let usfmResponse = await getText(`/burrito/ingredient/raw/${selectedBurrito.path}?ipath=${systemBcv.bookCode}.usfm`,
                        debugRef.current
                    );
                    console.log(usfmResponse);
                    if (usfmResponse.ok) {
                        const pk = new Proskomma();
                        pk.importDocument({
                            lang: "xxx",
                            abbr: "yyy"
                        },
                            "usfm",
                            usfmResponse.text
                        );
                        const query = `{docSets { documents { mainSequence { blocks(withScriptureCV: "${systemBcv.chapterNum}:${systemBcv.verseNum}") {text items {type subType payload}}}}}}`;
                        const result = pk.gqlQuerySync(query);
                        setVerseText(result.data.docSets[0].documents[0].mainSequence.blocks);
                    } else {
                        setVerseText([]);
                    }
                }

            };

            getVerseText().then();
        },
        [debugRef, systemBcv.bookCode, systemBcv.chapterNum, systemBcv.verseNum, metadata.local_path, selectedBurrito]
    );
    useEffect(() => {
        async function fetchSummaries() {
            try {
                const response = await fetch("/burrito/metadata/summaries");
                if (!response.ok) throw new Error(`HTTP error ${response.status}`);
                const data = await response.json();
                // Filter only those with flavor_type = scripture
                const burritoArray = Object.entries(data).map(([key, value]) => ({
                    path: key,
                    ...value,
                }));

                // Filter only scripture burritos
                const scriptures = burritoArray.filter(
                    (item) => item?.flavor === "textTranslation"
                );
                console.log(scriptures)
                setBurritos(scriptures);
            } catch (err) {
                console.error("Error fetching summaries:", err);
            } finally {
            }
        }
        fetchSummaries();
    }, []);

    const handleSelectBurrito = (event) => {
        const name = event.target.value;
        const burrito = burritos.find((b) => b.name === name);
        setSelectedBurrito(burrito);
    };

    const getAllData = async () => {
        const ingredientLink = `/burrito/ingredient/raw/_local_/_local_/stctw-test?ipath=plan.json`;
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

    if (!ingredient) { return <Typography> chargement...</Typography> }

    const isInInterval = (section, systemBcv) => {

        const [startChapter, startVerse] = section.cv[0].split(":").map(Number);
        const [endChapter, endVerse] = section.cv[1].split(":").map(Number);
        const chapterNum = systemBcv.chapterNum;
        const verseNum = systemBcv.verseNum;

        return (
            (chapterNum > startChapter || (chapterNum === startChapter && verseNum >= startVerse)) &&
            (chapterNum < endChapter || (chapterNum === endChapter && verseNum <= endVerse))
        );
    };

    const renderItem = item => {
        if (item.type === "token") {
            return item.payload;
        } else if (item.type === "scope" && item.subType === "start" && item.payload.startsWith("verses/")) {
            return <b style={{ fontSize: "smaller", paddingRight: "0.25em" }}>{item.payload.split("/")[1]}</b>
        } else {
            return ""
        }
    }

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Box
                sx={{ marginLeft: "auto" }}>
                <IconButton onClick={() => handleOpenDialogAbout()}>
                    <InfoIcon />
                </IconButton>
            </Box>
            <Box>
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel required id="burrito-select-label">
                        {doI18n(`pages:content:choose_document`, i18nRef.current)}
                    </InputLabel>
                    <Select
                        labelId="burrito-select-label"
                        value={selectedBurrito?.name || ""}
                        label="Choose Burrito"
                        onChange={handleSelectBurrito}
                    >
                        {burritos.map((burrito) => (
                            <MenuItem key={burrito.name} value={burrito.name}>
                                {burrito.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {ingredient && selectedBurrito ? (
                    <>
                        {ingredient.sections
                            .filter(section => isInInterval(section, systemBcv))
                            .map((section, index) => (
                                <Box
                                    sx={{ padding: 1 }}
                                    key={index}
                                >
                                    {section.bookCode === systemBcv.bookCode ? (
                                        <>
                                            {ingredient.sectionStructure.map((field, idx) => {
                                                const className = field.paraTag || "";
                                                const value =
                                                    section.fieldInitialValues?.[field.name] ??
                                                    ingredient.fieldInitialValues?.[field.name] ??
                                                    "";

                                                if (field.type === "scripture") {
                                                    return (
                                                        <>
                                                            {/* {section.paragraphs.map((p, idx) => (
                                                                <Box key={idx} mt={2}>
                                                                    <Typography className={className}>{p.paraTag}</Typography>
                                                                    <Typography>{p.units}</Typography>
                                                                </Box>
                                                            ))} */}
                                                            {
                                                                verseText.length > 0 ?
                                                                    verseText.map(b => <p style={{ marginBottom: "1em" }}>{b.items.map(i => renderItem(i))}</p>) :
                                                                    <p>No text found</p>
                                                            }
                                                        </>
                                                    );
                                                }

                                                return (
                                                    <Typography
                                                        key={idx}
                                                        className={className}
                                                        fullWidth
                                                        size="small"
                                                        value={value || ''}
                                                    >
                                                        {value}
                                                    </Typography>
                                                );
                                            })}


                                        </>
                                    ) : (
                                        <Typography>aucun livre disponible</Typography>
                                    )}
                                </Box>
                            ))}

                    </>
                ) : (
                    <Typography>Chargement...</Typography>
                )}
            </Box>

            <Dialog
                open={openDialogAbout}
                onClose={handleCloseDialogAbout}
            >
                <Box sx={{
                    margin: 1,
                    padding: 1
                }}>
                    <Typography>About </Typography>
                    {Object.entries(ingredient).map(([key, value]) => {
                        if (key === "sectionStructure" || key === "sections" || key === "fieldInitialValues") return null;
                        return (
                            <Box key={key} mb={2}>
                                <Typography fullWidth size="small" value={value || ''}> {value}</Typography>
                            </Box>
                        );
                    })}
                </Box>
            </Dialog>
        </Box>
    );
}
export default TranslationPlanViewerMuncher;
