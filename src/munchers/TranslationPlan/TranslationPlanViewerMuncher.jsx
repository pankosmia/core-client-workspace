import {useContext, useEffect, useState} from "react";
import {
    Box,
    Button,
    FormControl,
    IconButton,
    InputAdornment,
    Menu,
    MenuItem,
    TextField,
    Tooltip,
    Typography,
    useTheme
} from "@mui/material";
import {bcvContext as BcvContext, getText, debugContext, i18nContext, doI18n, postEmptyJson} from "pithekos-lib";
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import {Proskomma} from "proskomma-core";

import TextDir from '../helpers/TextDir';
import ExtractJsonValues from "../helpers/ExtractJsonValues";
import InformationDialog from "./InformationDialog";
import processUsfm from "./processUsfm";

function TranslationPlanViewerMuncher({metadata}) {
    const [planIngredient, setPlanIngredient] = useState();
    const {i18nRef} = useContext(i18nContext);
    const {systemBcv} = useContext(BcvContext);
    const {debugRef} = useContext(debugContext);
    const [verseText, setVerseText] = useState({});
    const [burritos, setBurritos] = useState([]);
    const [selectedBurrito, setSelectedBurrito] = useState(null);
    const [selectedStory, setSelectedStory] = useState();
    const [search, setSearch] = useState("");
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
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
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

        fetchSummaries();
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

    const handleSelectBurrito = (event) => {
        const name = event.target.value;
        const burrito = burritos.find(b => b.name === name);
        setSelectedBurrito(burrito);
    };

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

    useEffect(
        () => {
            loadCSS();
        },
        [selectedBurritoTextDir]
    );

    useEffect(
        () => {
            getAllData().then();
        },
        []
    );

    if (!planIngredient) {
        return <Typography> loading...</Typography>
    }

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

    const section = planIngredient.sections.find(
        section =>
            section.bookCode === systemBcv.bookCode &&
            isInInterval(section, systemBcv)
    );

    const filteredStories = planIngredient.sections.filter(
        c => {
            const label = `${c.fieldInitialValues.reference} ${c.fieldInitialValues.sectionTitle}`
                .toLowerCase();

            return label.includes(search.toLowerCase());
        }
    );

    const updateBcv = (b, c, v) => {
        postEmptyJson(
            `/navigation/bcv/${b}/${c}/${v}`,
            debugRef.current
        );
    }
    const ITEM_HEIGHT = 48;

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
                <Button
                    id="fade-button"
                    aria-controls={open ? 'fade-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                >
                    {doI18n(`pages:core-local-workspace:jump_to_story`, i18nRef.current)}
                </Button>
                <Menu
                    id="fade-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    slotProps={{
                        paper: {
                            style: {
                                maxHeight: ITEM_HEIGHT * 4.5,
                                width: 'auto',
                                overflow: "auto"
                            },
                        },
                        list: {
                            'aria-labelledby': 'fab-menu',
                        },
                    }}
                >
                    <MenuItem>
                        <TextField
                            placeholder="Search ..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.stopPropagation()}
                            size="small"
                            fullWidth
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon/>
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                    </MenuItem>
                    {filteredStories.length === 0 ? (
                        <MenuItem disabled>
                            {`${doI18n("pages:core-local-workspace:no_result", i18nRef.current, debugRef.current)}`}
                        </MenuItem>
                    ) : (
                        filteredStories.map(
                            (c, i) => (
                                <Tooltip key={i} title={c.fieldInitialValues.reference}>
                                    <MenuItem
                                        onClick={
                                            () => {
                                                setSelectedStory(c.fieldInitialValues.sectionNumber);
                                                handleClose();
                                                updateBcv(
                                                    c.bookCode,
                                                    c.cv[0].split(":")[0],
                                                    c.cv[0].split(":")[1]
                                                );
                                            }
                                        }
                                        value={c.fieldInitialValues.sectionNumber}
                                        selected={selectedStory === c.fieldInitialValues.sectionNumber}
                                    >
                                        {c.fieldInitialValues.sectionNumber} - {c.fieldInitialValues.sectionTitle}
                                    </MenuItem>
                                </Tooltip>
                            )
                        )
                    )
                    }

                </Menu>
                <IconButton onClick={() => handleOpenDialogAbout()}>
                    <InfoIcon/>
                </IconButton>
            </Box>
            <Box>
                {/* choose your resources */}
                <FormControl fullWidth
                             sx={{paddingLeft: "1rem", paddingRight: "1rem"}}>
                    <TextField
                        required
                        id="burrito-select-label"
                        select
                        value={selectedBurrito?.name || ""}
                        onChange={handleSelectBurrito}
                        label={doI18n(`pages:core-local-workspace:choose_document`, i18nRef.current)}

                    >
                        {
                            burritos.map(
                                (burrito) => (
                                    <MenuItem key={burrito.name} value={burrito.name}>
                                        {burrito.name}
                                    </MenuItem>
                                )
                            )
                        }

                    </TextField>
                </FormControl>

                {planIngredient && selectedBurrito && (
                    <>
                        {section ? (
                            <Box sx={{padding: 1}}>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        fontFamily: "monospace",
                                        fontSize: "medium",
                                    }}>
                                    <Typography
                                        sx={{
                                            padding: "5px",
                                            background: "lightgray",
                                            borderRadius: "4px 0px 0px 4px",
                                            alignSelf: "center"
                                        }}>
                                        {"//"}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            padding: "5px",
                                            background: "lightgray",
                                            borderRadius: "0px 4px 4px 0px"
                                        }}
                                    >
                                        {section.cv.join('-')}
                                    </Typography>
                                </div>

                                {planIngredient.sectionStructure.map(
                                    (field, i) => {
                                        if (field.type !== "scripture") {
                                            const styleParaTag = field.paraTag || "";
                                            const value =
                                                section.fieldInitialValues[field.name] ||
                                                planIngredient.fieldInitialValues[field.name] ||
                                                "";
                                            return (
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        flexDirection: "row",
                                                        alignItems: "center",
                                                        textAlign: "left",
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            fontFamily: "monospace",
                                                            fontSize: "medium",
                                                            paddingRight: "1em",
                                                        }}
                                                    >
                                                        {styleParaTag}
                                                    </Typography>

                                                    <Typography
                                                        className={styleParaTag}
                                                        size="small"
                                                    >
                                                        {value}
                                                    </Typography>
                                                </div>
                                            );
                                        }
                                        if (field.type === "scripture") {
                                            if (Object.keys(verseText).length > 0) {
                                                let chapterN = "0"
                                                return (
                                                    <Box dir={selectedBurritoTextDir}>
                                                        {
                                                            section.paragraphs
                                                                .map(
                                                                    p => {
                                                                        if (p.units) {
                                                                            const c = p.units[0].split(":")[0]
                                                                            const newChapter = c !== chapterN
                                                                            if (newChapter) {
                                                                                chapterN = c
                                                                            }
                                                                            return (
                                                                                <>
                                                                                    {newChapter && <div
                                                                                        className="marks_chapter_label">{c}</div>}
                                                                                    <div className={p.paraTag}>
                                                                                        {
                                                                                            p.units.map(
                                                                                                cv => <span>
                                                                                            <span
                                                                                                className="marks_verses_label">{cv.split(":")[1]} </span>
                                                                                            <span>{verseText[cv.split(":")[0]][cv.split(":")[1]]} </span>
                                                                                        </span>
                                                                                            )
                                                                                        }
                                                                                    </div>
                                                                                </>
                                                                            )
                                                                        } else {
                                                                            return <div className={p.paraTag}>
                                                                                {section.fieldInitialValues[p.name]}
                                                                                {" "}
                                                                                ({p.cv.join(" - ")})
                                                                            </div>
                                                                        }
                                                                    }
                                                                )
                                                        }
                                                    </Box>
                                                );
                                            } else {
                                                return <Typography><b><i>{doI18n("pages:core-local-workspace:no_scripture_for_story", i18nRef.current)}</i></b></Typography>
                                            }
                                        } else {
                                            return <Typography> loading ...</Typography>
                                        }
                                    }
                                )
                                }
                            </Box>
                        ) : (
                            <Typography> no book found </Typography>
                        )
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