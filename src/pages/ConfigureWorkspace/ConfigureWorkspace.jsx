import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Header, debugContext, i18nContext, currentProjectContext, getJson, doI18n } from "pithekos-lib";
import {
    Box,
    Typography,
    Fab,
    ToggleButtonGroup,
    ToggleButton,
    Grid2
} from "@mui/material";

import { DataGrid } from '@mui/x-data-grid';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SvgViewEditorBottom from "../../munchers/TextTranslation/SimplifiedEditor/plugings/view_editor_bottom";
import SvgViewEditorLeftColumn from "../../munchers/TextTranslation/SimplifiedEditor/plugings/view_editor_left_column";
import SvgViewEditorRightColumn from "../../munchers/TextTranslation/SimplifiedEditor/plugings/view_editor_right_column";
import SvgViewEditorLeftRow from "../../munchers/TextTranslation/SimplifiedEditor/plugings/view_editor_left_row";
import SvgViewEditorRightRow from "../../munchers/TextTranslation/SimplifiedEditor/plugings/view_editor_right_row";
import SvgViewEditorTop from "../../munchers/TextTranslation/SimplifiedEditor/plugings/view_editor_top";
import SvgViewEditorTopDisabled from "../../munchers/TextTranslation/SimplifiedEditor/plugings/view_editor_top_disabled";
import SvgViewEditorBottomDisabled from "../../munchers/TextTranslation/SimplifiedEditor/plugings/view_editor_bottom_disabled";
import SvgViewEditorLeftColumnDisabled from "../../munchers/TextTranslation/SimplifiedEditor/plugings/view_editor_left_column_disabled";
import SvgViewEditorLeftRowDisabled from "../../munchers/TextTranslation/SimplifiedEditor/plugings/view_editor_left_row_disabled";
import SvgViewEditorRightRowDisabled from "../../munchers/TextTranslation/SimplifiedEditor/plugings/view_editor_right_row_disabled";
import SvgViewEditorRightColumnDisabled from "../../munchers/TextTranslation/SimplifiedEditor/plugings/view_editor_right_column_disabled";

function ConfigureWorkspace({ layout, setLayout }) {

    const { debugRef } = useContext(debugContext);
    const { i18nRef } = useContext(i18nContext);
    const { currentProjectRef } = useContext(currentProjectContext);

    const [selectedResources, setSelectedResources] = useState([]);
    const navigate = useNavigate();

    const [projectSummaries, setProjectSummaries] = useState({});

    const [isoOneToThreeLookup, setIsoOneToThreeLookup] = useState([]);
    const [isoThreeLookup, setIsoThreeLookup] = useState([]);
    const [alignment, setAlignment] = useState("rightH");

    const getProjectSummaries = async () => {
        const summariesResponse = await getJson("/burrito/metadata/summaries", debugRef.current);
        if (summariesResponse.ok) {
            setProjectSummaries(summariesResponse.json);
        }
    }
    const handleAlignment = (event, newAlignment) => {
        setAlignment(newAlignment);
    };

    useEffect(
        () => {
            getProjectSummaries().then();
        },
        []
    );

    useEffect(() => {
        fetch('/app-resources/lookups/iso639-1-to-3.json') // ISO_639-1 codes mapped to ISO_639-3 codes
            .then(r => r.json())
            .then(data => setIsoOneToThreeLookup(data));
    }, []);

    useEffect(() => {
        fetch('/app-resources/lookups/iso639-3.json') // ISO_639-3 2025-02-21 from https://hisregistries.org/rol/ plus zht, zhs, nep

            .then(r => r.json())
            .then(data => setIsoThreeLookup(data));
    }, []);

    const projectFlavors = {
        "textTranslation": "myBcvList",
        "audioTranslation": "myBcvList",
        "x-bcvnotes": "myBcvList",
        "x-bnotes": "myBcvList",
        "x-bcvarticles": "myBcvList",
        "x-bcvquestions": "myBcvList",
        "x-bcvQuestions": "myBcvList",
        "x-bcvimages": "myBcvList",
        "x-bcvvideo": "myBcvList",
        "x-juxtalinear": "myBcvList",
        "x-parallel": "myBcvList",
        "x-bcvImages": "myBcvList",
        "textStories": "myObsList",
        "x-obsimages": [],
        "x-obsarticles": "myObsList",
        "x-obsquestions": "myObsList",
        "x-obsnotes": "myObsList",
        "x-translationplan": "myBcvList"
    };

    const flavorTypes = {
        textTranslation: "scripture",
        audioTranslation: "scripture",
        "x-bcvnotes": "parascriptural",
        "x-bnotes": "parascriptural",
        "x-bcvarticles": "parascriptural",
        "x-bcvquestions": "parascriptural",
        "x-bcvimages": "parascriptural",
        "x-juxtalinear": "scripture",
        "x-parallel": "parascriptural",
    };

    const columns = [
        {
            field: 'name',
            headerName: doI18n("pages:core-local-workspace:row_name", i18nRef.current),
            minWidth: 110,
            flex: 1
        },
        {
            field: 'description',
            headerName: doI18n("pages:core-local-workspace:row_description", i18nRef.current),
            minWidth: 130,
            flex: 1
        },
        {
            field: 'type',
            headerName: doI18n("pages:core-local-workspace:row_type", i18nRef.current),
            minWidth: 80,
            flex: 0.75
            //valueGetter: v => doI18n(`flavors:names:${flavorTypes[v.toLowerCase()]}/${v}`, i18nRef.current)
        },
        {
            field: 'language',
            headerName: doI18n("pages:core-local-workspace:row_language", i18nRef.current),
            minWidth: 120,
            flex: 1
        }
    ]

    const rows = Object.entries(projectSummaries)
        .map(e => {
            return { ...e[1], path: e[0] }
        })
        .filter((r) => currentProjectRef.current && projectFlavors[projectSummaries[r.path].flavor] === projectFlavors[projectSummaries[`_local_/_local_/${currentProjectRef.current.project}`].flavor])
        .filter(r => r.path !== `_local_/_local_/${currentProjectRef.current && currentProjectRef.current.project}`)
        .map((rep, n) => {
            return {
                ...rep,
                id: n.toString(),
                name: `${rep.name} (${rep.abbreviation})`,
                description: rep.description !== rep.name ? rep.description : "",
                type: rep.flavor,
                language: isoThreeLookup?.[isoOneToThreeLookup[rep.language_code] ?? rep.language_code]?.en ??
                    rep.language_code
            }
        });

    return Object.keys(i18nRef.current).length === 0 ?
        <p>...</p> :
        <Box>
            <Box style={{ position: 'fixed', width: '100%' }}>
                <Header
                    titleKey="pages:core-local-workspace:Select_Resources"
                    requireNet={false}
                    currentId="core-local-workspace"
                />
            </Box>
            <Box
                sx={{
                    position: "fixed",
                    top: "40px",
                    left: 0,
                    right: 0,
                    display: "flex",
                    padding: 2,
                }}>
                <Grid2
                    container
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                >
                    <Grid2 display="flex" gap={1}>
                        <Typography
                        > {doI18n("pages:core-local-workspace:choose_resources_workspace", i18nRef.current)}
                        </Typography>

                    </Grid2>
                    <Grid2 display="flex" gap={1}>
                        <ToggleButtonGroup
                            value={alignment}
                            exclusive
                            onChange={handleAlignment}
                        >
                            <ToggleButton value="top" onClick={() => setLayout("top")} disabled={selectedResources.length === 0}
                            >
                                {selectedResources.length === 0 ?
                                    (
                                        <SvgViewEditorTopDisabled />
                                    ) :
                                    <SvgViewEditorTop />
                                }
                            </ToggleButton>

                            <ToggleButton value="bottom" onClick={() => setLayout("bottom")} disabled={selectedResources.length === 0}>
                                {selectedResources.length === 0 ?
                                    (
                                        <SvgViewEditorBottomDisabled />
                                    ) :
                                    <SvgViewEditorBottom />
                                }
                            </ToggleButton>

                            <ToggleButton value="leftV" onClick={() => setLayout("leftV")} disabled={selectedResources.length === 0}>
                                {selectedResources.length === 0 ?
                                    (
                                        <SvgViewEditorLeftColumnDisabled />
                                    ) :
                                    <SvgViewEditorLeftColumn />
                                }
                            </ToggleButton>

                            <ToggleButton value="rightV" onClick={() => setLayout("rightV")} disabled={selectedResources.length === 0}>
                                {selectedResources.length === 0 ?
                                    (
                                        <SvgViewEditorRightColumnDisabled />
                                    ) :
                                    <SvgViewEditorRightColumn />
                                }
                            </ToggleButton>

                            <ToggleButton value="leftH" onClick={() => setLayout("leftH")} disabled={selectedResources.length === 0}>

                                {selectedResources.length === 0 ?
                                    (
                                        <SvgViewEditorLeftRowDisabled />
                                    ) :
                                    <SvgViewEditorLeftRow />
                                }
                            </ToggleButton>

                            <ToggleButton value="rightH" onClick={() => setLayout("rightH")} disabled={selectedResources.length === 0}>
                                {selectedResources.length === 0 ?
                                    (
                                        <SvgViewEditorRightRowDisabled />
                                    ) :
                                    <SvgViewEditorRightRow />
                                }
                            </ToggleButton>

                        </ToggleButtonGroup>
                    </Grid2>
                    <Grid2
                        display="flex"
                        gap={1}
                    >
                        <Fab
                            variant="extended"
                            color="primary"
                            size="small"
                            aria-label={doI18n("pages:content:add", i18nRef.current)}
                            // sx={{
                            //     margin: 0,
                            //     top: 64,
                            //     right: 16,
                            //     bottom: "auto",
                            //     left: "auto",
                            //     position: 'fixed'
                            // }}
                            onClick={
                                (e) => {
                                    let stateEntries = Object.entries(projectSummaries)
                                        .map(e => {
                                            return { ...e[1], path: e[0] }
                                        })
                                        .map(r => [r.path, r])
                                        .filter(re => selectedResources.includes(re[0]) || (currentProjectRef.current && re[0] === Object.values(currentProjectRef.current).join("/")))
                                        .map(re => (currentProjectRef.current && re[0] === Object.values(currentProjectRef.current).join("/")) ? [re[0], {
                                            ...re[1],
                                            primary: true
                                        }] : re)
                                    navigate(
                                        "/workspace",
                                        {
                                            state: Object.fromEntries(stateEntries)
                                        }
                                    );
                                    e.stopPropagation();
                                }
                            }
                        >
                            <Typography variant="body2">
                                {`${doI18n("pages:core-local-workspace:editing", i18nRef.current, debugRef.current)} ${currentProjectRef.current && currentProjectRef.current.project}`}
                            </Typography>
                            <PlayArrowIcon />
                        </Fab>
                    </Grid2>

                </Grid2>

            </Box>

            <Box style={{
                position: 'fixed',
                top: '130px',
                bottom: 0,
                overflow: 'auto',
                marginBottom: "16px",
                width: '100%'
            }}>
                <Box sx={{ ml: 2 }}>
                    <DataGrid
                        initialState={{
                            columns: {
                                columnVisibilityModel: {
                                    description: false
                                }
                            },
                            sorting: {
                                sortModel: [{ field: 'name', sort: 'asc' }],
                            }
                        }}
                        checkboxSelection
                        onRowSelectionModelChange={(selected) => {
                            const selectedRowData = rows.filter((row) => selected.ids.has(row.id));
                            const selectedPaths = selectedRowData.map((data) => data["path"]);
                            setSelectedResources(selectedPaths);
                        }}
                        rows={rows}
                        columns={columns}
                        sx={{ fontSize: "1rem" }}
                    />
                </Box>
            </Box>
        </Box>
}

export default ConfigureWorkspace;
