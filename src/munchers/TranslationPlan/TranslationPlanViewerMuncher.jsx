import {useContext, useEffect, useState} from "react";
import {
    Box,
    IconButton,
    Typography,
    useTheme
} from "@mui/material";
import {bcvContext as BcvContext, getText, debugContext} from "pithekos-lib";
import InfoIcon from '@mui/icons-material/Info';

import TextDir from '../helpers/TextDir';
import ExtractJsonValues from "../helpers/ExtractJsonValues";
import InformationDialog from "./InformationDialog";
import processUsfm from "./processUsfm";
import ScripturePicker from "./ScripturePicker";
import ScriptureField from './ScriptureField';
import NonScriptureField from "./NonScriptureField";
import JumpButton from "./JumpButton";
import SectionReference from "./SectionReference";

function TranslationPlanViewerMuncher({metadata}) {
    const [planIngredient, setPlanIngredient] = useState();
    const {systemBcv} = useContext(BcvContext);
    const {debugRef} = useContext(debugContext);
    const [verseText, setVerseText] = useState({});
    const [burritos, setBurritos] = useState([]);
    const [selectedBurrito, setSelectedBurrito] = useState(null);
    const [selectedStory, setSelectedStory] = useState();
    const [textDir, setTextDir] = useState(
        metadata?.script_direction ? metadata.script_direction.toLowerCase() : undefined
    );
    const [selectedBurritoSbTextDir, setSelectedBurritoSbTextDir] = useState(undefined);
    const [selectedBurritoTextDir, setSelectedBurritoTextDir] = useState(undefined);
    const [openDialogAbout, setOpenDialogAbout] = useState(false);

    const sbScriptDir = metadata?.script_direction ? metadata.script_direction.toLowerCase() : undefined
    const sbScriptDirSet = sbScriptDir === 'ltr' || sbScriptDir === 'rtl';

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const theme = useTheme();
    const handleOpenDialogAbout = () => {
        setOpenDialogAbout(true);
    }

    useEffect(
        () => {
            const getChapterText = async () => {
                if (selectedBurrito) {
                    let usfmResponse = await getText(`/burrito/ingredient/raw/${selectedBurrito.path}?ipath=${systemBcv.bookCode}.usfm`,
                        debugRef.current
                    );
                    if (usfmResponse.ok) {
                        const sbSelectedScriptDirSet = selectedBurritoSbTextDir === 'ltr' || selectedBurritoSbTextDir === 'rtl';
                        if (!sbSelectedScriptDirSet) {
                            const dir = await TextDir(usfmResponse.text, 'usfm');
                            if (dir !== sbSelectedScriptDirSet) {
                                setSelectedBurritoTextDir(dir);
                            }
                        }
                        const newVerseText = processUsfm(usfmResponse.text);
                        setVerseText(newVerseText);
                    } else {
                        setVerseText([]);
                    }
                }
            };

            getChapterText().then();
        },
        [debugRef, systemBcv.bookCode, selectedBurrito, selectedBurritoSbTextDir]
    );
    useEffect(() => {
        async function fetchSummaries() {
            try {
                const response = await fetch("/burrito/metadata/summaries");
                if (!response.ok) throw new Error(`HTTP error ${response.status}`);
                const data = await response.json();
                // Filter only those with flavor_type = scripture
                const burritoArray = Object.entries(data).map(
                    ([key, value]) => (
                        {
                            path: key,
                            ...value,
                        }
                    )
                );

                // Filter only scripture burritos
                const scriptures = burritoArray.filter(
                    (item) => item?.flavor === "textTranslation"
                );
                setBurritos(scriptures);
            } catch (err) {
                console.error("Error fetching summaries:", err);
            }
        }

        fetchSummaries().then();
    }, [selectedBurrito]);

    useEffect(() => {
        if (selectedBurrito !== null) {
            setSelectedBurritoSbTextDir(
                selectedBurrito?.script_direction ? selectedBurrito.script_direction.toLowerCase() : undefined
            );
            setSelectedBurritoTextDir(
                selectedBurrito?.script_direction ? selectedBurrito.script_direction.toLowerCase() : undefined
            );
        }
    }, [selectedBurrito])

    useEffect(
        () => {
            async function loadCSS() {
                const url = selectedBurritoTextDir === "ltr" ? "/app-resources/usfm/bible_page_styles.css" : "/app-resources/usfm/bible_page_styles_rtl.css";
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

            loadCSS().then();
        },
        [selectedBurritoTextDir]
    );

    useEffect(
        () => {
            const getAllData = async () => {
                const ingredientLink = `/burrito/ingredient/raw/${metadata.local_path}?ipath=plan.json`;
                const response = await fetch(ingredientLink);
                if (response.ok) {
                    const data = await response.json();
                    setPlanIngredient(data);
                    const planText = ExtractJsonValues(data, ['name', 'description', 'sectionTitle', 'themeBody', 'principle', 'principleMore']).toString().replace(/,/g, "");
                    if (!sbScriptDirSet) {
                        const dir = await TextDir(planText.toString(), 'text');
                        setTextDir(dir);
                    }

                } else {
                    setPlanIngredient({});
                }
            };
            getAllData().then();
        },
        [sbScriptDirSet, metadata.local_path]
    );

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

    if (!planIngredient) {
        return <Typography> loading...</Typography>
    }

    const section = planIngredient.sections.find(
        section =>
            section.bookCode === systemBcv.bookCode &&
            isInInterval(section, systemBcv)
    );

    // If SB does not specify direction then it is set here, otherwise it has already been set per SB in WorkspaceCard
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
            }}
            dir={!sbScriptDirSet ? textDir : undefined}
        >
            <Box
                sx={{marginLeft: "auto"}}>
                <JumpButton
                    planIngredient={planIngredient}
                    selectedStory={selectedStory}
                    setSelectedStory={setSelectedStory}
                    anchorEl={anchorEl}
                    setAnchorEl={setAnchorEl}
                    open={open}
                />
                <IconButton onClick={handleOpenDialogAbout}>
                    <InfoIcon/>
                </IconButton>
            </Box>
            <Box>
                <ScripturePicker
                    burritos={burritos}
                    selectedBurrito={selectedBurrito}
                    setSelectedBurrito={setSelectedBurrito}
                />

                {
                    selectedBurrito && (
                        <>
                            {
                                section && <Box sx={{padding: 1}}>
                                    <SectionReference section={section}/>
                                    {
                                        planIngredient.sectionStructure.map(
                                            (field, i) => {
                                                if (field.type === "scripture") {
                                                    return <ScriptureField
                                                        key={i}
                                                        section={section}
                                                        verseText={verseText}
                                                        selectedBurritoTextDir={selectedBurritoTextDir}
                                                    />
                                                } else {
                                                    return <NonScriptureField
                                                        key={i}
                                                        planIngredient={planIngredient}
                                                        section={section}
                                                        field={field}
                                                    />

                                                }
                                            }
                                        )
                                    }
                                </Box>
                            }
                            {
                                !section &&
                                <Typography> no content found </Typography>
                            }
                        </>
                    )
                }
            </Box>
            <InformationDialog
                theme={theme}
                planIngredient={planIngredient}
                openDialogAbout={openDialogAbout}
                setOpenDialogAbout={setOpenDialogAbout}
            />
        </Box>
    );
}

export default TranslationPlanViewerMuncher;