import {useContext, useEffect, useState} from "react";
import {
    Box,
    Button,
    DialogContent,
    DialogContentText,
    FormControl,
    IconButton,
    InputAdornment,
    Menu,
    MenuItem,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import {bcvContext as BcvContext, getText, debugContext, i18nContext, doI18n, postEmptyJson} from "pithekos-lib";
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import {Proskomma} from "proskomma-core";
import {PanDialog} from 'pankosmia-rcl';

import TextDir from '../helpers/TextDir';
import ExtractJsonValues from "../helpers/ExtractJsonValues";

function TranslationPlanViewerMuncher({metadata}) {
    const [planIngredient, setPlanIngredient] = useState();
    const {i18nRef} = useContext(i18nContext);
    const {systemBcv} = useContext(BcvContext);
    const [openDialogAbout, setOpenDialogAbout] = useState(false);
    const {debugRef} = useContext(debugContext);
    const [verseText, setVerseText] = useState({});
    const [burritos, setBurritos] = useState([]);
    const [selectedBurrito, setSelectedBurrito] = useState(null);
    const [selectedStory, setSelectedStory] = useState();
    const [search, setSearch] = useState("");
    const [textDir, setTextDir] = useState(metadata.script_direction.toLowerCase());
    const [selectedBurritoSbTextDir, setSelectedBurritoSbTextDir] = useState(undefined);
    const [selectedBurritoTextDir, setSelectedBurritoTextDir] = useState(undefined);

    const sbScriptDir = metadata.script_direction.toLowerCase();
    const sbScriptDirSet = sbScriptDir === 'ltr' || sbScriptDir === 'rtl';

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
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
                    if (usfmResponse.ok) {
                        const pk = new Proskomma();
                        pk.importDocument({
                                lang: "xxx",
                                abbr: "yyy"
                            },
                            "usfm",
                            usfmResponse.text
                        );
                        const sbSelectedScriptDirSet = selectedBurritoSbTextDir === 'ltr' || selectedBurritoSbTextDir === 'rtl';
                        if (!sbSelectedScriptDirSet) {
                          const dir = await TextDir(usfmResponse.text, 'usfm');
                          setSelectedBurritoTextDir(dir);
                        }
                        const query = `{
                                            documents {
                                                header(id: "bookCode")
                                                cvIndexes {
                                                chapter
                                                verses {
                                                    verse {
                                                    verseRange
                                                    text
                                                    }
                                                }
                                                }
                                            }
                                        }`;

                        const result = pk.gqlQuerySync(query);
                        const newVerseText = Object.fromEntries(
                            result.data.documents[0].cvIndexes
                                .map(
                                    i => [
                                        i.chapter,
                                        Object.fromEntries(
                                            i.verses
                                                .map(
                                                    (v, n) => [
                                                        `${n}`,
                                                        v.verse.length > 0 ?
                                                            v.verse[0].text :
                                                            []
                                                    ]
                                                )
                                                .filter(kv => typeof kv[1] === "string")
                                        )
                                    ]
                                )
                        )
                        setVerseText(newVerseText);
                    } else {
                        setVerseText([]);
                    }
                }

            };

            getVerseText().then();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [debugRef, systemBcv.bookCode, selectedBurrito]
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
            setSelectedBurritoSbTextDir(selectedBurrito.script_direction.toLowerCase());
            setSelectedBurritoTextDir(selectedBurrito.script_direction.toLowerCase());
        }
    },[selectedBurrito])

    const handleSelectBurrito = (event) => {
        const name = event.target.value;
        const burrito = burritos.find(b => b.name === name);
        setSelectedBurrito(burrito);
    };

    const getAllData = async () => {
        const ingredientLink = `/burrito/ingredient/raw/_local_/_sideloaded_/stctw-test?ipath=plan.json`;
        const response = await fetch(ingredientLink);

        if (response.ok) {
            const data = await response.json();
            setPlanIngredient(data);
            const planText = ExtractJsonValues(data, ['name', 'description', 'sectionTitle', 'themeBody', 'principle', 'principleMore']);
            if (!sbScriptDirSet) {
              const dir = await TextDir(planText.toString(), 'text');
              setTextDir(dir);
            }

        } else {
            setPlanIngredient([]);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selectedBurritoTextDir]
    );

    useEffect(
        () => {
            getAllData().then();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                                        if (Object.keys(verseText).length > 0 && field.type === "scripture") {
                                            let chapterN = "0"
                                            return (
                                              <Box dir={selectedBurritoTextDir}>
                                                <div>
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
                                                </div>
                                              </Box>
                                            );
                                        } else {
                                            <Typography> loading ...</Typography>
                                        }
                                        return null;
                                    }
                                )
                                }
{/** </Box> */}
                            </Box>
                        ) : (
                            <Typography> no book found </Typography>
                        )
                        }
                    </>
                )
                }
            </Box>

            {/* Dialog d'information */}
            <PanDialog
                titleLabel="About"
                isOpen={openDialogAbout}
                closeFn={() => handleCloseDialogAbout()}
            >
                <DialogContent>
                    {Object.entries(planIngredient).map(([key, value]) => {
                            const hiddenKeys = ["sectionStructure", "sections", "fieldInitialValues", "short_name", "versification"]
                            if (hiddenKeys.includes(key)) {
                                return null;
                            }
                            return (
                                <DialogContentText key={key} mb={2}>
                                    <Typography fullWidth size="small">
                                        {value}
                                    </Typography>
                                </DialogContentText>
                            );
                        }
                    )
                    }
                </DialogContent>
            </PanDialog>
        </Box>
    );
}

export default TranslationPlanViewerMuncher;
