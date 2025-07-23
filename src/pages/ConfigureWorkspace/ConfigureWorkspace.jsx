import {useState, useEffect, useContext} from "react";
import {useNavigate} from "react-router-dom";
import {Header, debugContext, i18nContext, currentProjectContext, getJson, doI18n} from "pithekos-lib";
import {
    Box,
    Typography,
    Fab
} from "@mui/material";
import {DataGrid} from '@mui/x-data-grid';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

function ConfigureWorkspace() {

    const {debugRef} = useContext(debugContext);
    const {i18nRef} = useContext(i18nContext);
    const {currentProjectRef} = useContext(currentProjectContext);

    const [selectedResources, setSelectedResources] = useState([]);
    const navigate = useNavigate();

    const [ projectSummaries, setProjectSummaries ] = useState({});

    const getProjectSummaries = async () => {
        const summariesResponse = await getJson("/burrito/metadata/summaries", debugRef.current);
        if (summariesResponse.ok) {
            setProjectSummaries(summariesResponse.json);
        }
    }

    useEffect(
        () => {
            getProjectSummaries().then();
        },
        []
    );

    const projectFlavors = {
        "textTranslation": "myBcvList",
        "audioTranslation": "myBcvList",
        "x-bcvnotes": "myBcvList",
        "x-bnotes": "myBcvList",
        "x-bcvarticles": "myBcvList",
        "x-bcvquestions": "myBcvList",
        "x-bcvQuestions": "myBcvList",
        "x-bcvimages": "myBcvList",
        "x-juxtalinear": "myBcvList",
        "x-parallel": "myBcvList",
        "x-bcvImages": "myBcvList",
        "textStories": "myObsList",
        "x-obsimages": "myObsList",
        "x-obsarticles": "myObsList",
        "x-obsquestions": "myObsList",
        "x-obsnotes": "myObsList",
        "x-obsquestions": "myObsList"
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
        "x-parallel": "parascriptural"
    };

    const columns = [
        {
            field: 'name',
            headerName: <Typography>{doI18n("pages:core-local-workspace:row_name", i18nRef.current)}</Typography>,
            flex: 1
        },
        {
            field: 'description',
            headerName: <Typography>{doI18n("pages:core-local-workspace:row_description", i18nRef.current)}</Typography>,
            flex: 1
        },
        {
            field: 'type',
            headerName: <Typography>{doI18n("pages:core-local-workspace:row_type", i18nRef.current)}</Typography>,
            flex: 0.75
            //valueGetter: v => doI18n(`flavors:names:${flavorTypes[v.toLowerCase()]}/${v}`, i18nRef.current)
        },
        {
            field: 'language',
            headerName: <Typography>{doI18n("pages:core-local-workspace:row_language", i18nRef.current)}</Typography>,
            flex: 1
        }
    ]

    const rows = Object.entries(projectSummaries)
                    .map(e => {
                        return {...e[1], path: e[0]}
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
                            language: rep.language_code
                        }
                    });

    return Object.keys(i18nRef.current).length === 0 ?
        <p>...</p> :
        <Box>
            <Box style={{position: 'fixed', width: '100%'}}>
                <Header
                    titleKey="pages:core-local-workspace:title"
                    requireNet={false}
                    currentId="core-local-workspace"
                />
            </Box>
            <Box
                style={{mb: 2, position: 'fixed', top: '64px', bottom: 0, right: 0, overflow: 'scroll', width: '100%'}}>
                <Fab
                    variant="extended"
                    color="secondary"
                    size="small"
                    aria-label={doI18n("pages:content:add", i18nRef.current)}
                    sx={{
                        margin: 0,
                        top: 64,
                        right: 16,
                        bottom: "auto",
                        left: "auto",
                        position: 'fixed'
                    }}
                    onClick={
                        (e) => {
                            let stateEntries = Object.entries(projectSummaries)
                                .map(e => {
                                    return {...e[1], path: e[0]}
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
                    <PlayArrowIcon/>
                </Fab>
            </Box>
            <Box style={{
                position: 'fixed',
                top: '105px',
                bottom: 0,
                overflow: 'scroll',
                marginBottom: "16px",
                width: '100%'
            }}>
                <Box sx={{ml: 2}}>
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
                        sx={{fontSize: "1rem"}}
                    />
                </Box>
            </Box>
        </Box>
}

export default ConfigureWorkspace;
