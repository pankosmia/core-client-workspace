import React, {useState, useEffect, useContext} from "react";
import {useNavigate} from "react-router-dom";
import {Header, debugContext, i18nContext, currentProjectContext, getJson, doI18n} from "pithekos-lib";
import {Grid2, Stack, Box, Typography, Checkbox, Fab} from "@mui/material";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import dateFormat from 'dateformat';

function ConfigureWorkspace() {
    const [repos, setRepos] = useState([]);
    const {debugRef} = useContext(debugContext);
    const {i18nRef} = useContext(i18nContext);
    const {currentProjectRef} = useContext(currentProjectContext);

    const [selectedResources, setSelectedResources] = useState([]);

    const navigate = useNavigate();

    const getRepoList = async () => {
        const listResponse = await getJson("/git/list-local-repos", debugRef.current);
        if (listResponse.ok) {
            let responses = [];
            for (const repoPath of listResponse.json) {
                const metadataResponse = await getJson(`/burrito/metadata/summary/${repoPath}`);
                if (metadataResponse.ok) {
                    responses.push({path: repoPath, ...metadataResponse.json})
                }
            }
            setRepos(responses);
        }
    }

    useEffect(
        () => {
            getRepoList().then();
        },
        []
    );
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
            <Box style={{position: 'fixed', top: '48px', bottom: 0, overflow: 'scroll'}}>
                <Fab
                    variant="extended"
                    size="small"
                    aria-label={doI18n("pages:content:add", i18nRef.current)}
                    sx={{
                        margin: 0,
                        top: 68,
                        right: 20,
                        bottom: "auto",
                        left: "auto",
                        position: 'fixed',
                        backgroundColor: "#DAB1DA",
                        color: "#OOO"
                    }}
                    onClick={
                        (e) => {
                            console.log(currentProjectRef.current);
                            let stateEntries = repos
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
                <Grid2
                    container
                    spacing={1}
                    sx={{
                        ml: "20px",
                        '--Grid-borderWidth': '1px',
                        borderTop: 'var(--Grid-borderWidth) solid',
                        borderLeft: 'var(--Grid-borderWidth) solid',
                        borderColor: 'divider',
                        '& > div': {
                            borderRight: 'var(--Grid-borderWidth) solid',
                            borderBottom: 'var(--Grid-borderWidth) solid',
                            borderColor: 'divider',
                        }
                    }}
                >
                    <Grid2 item size={12}>
                        <Typography variant="h6">
                            {doI18n("pages:core-local-workspace:choose_resources", i18nRef.current)}
                        </Typography>
                    </Grid2>
                    {
                        repos
                            .filter(r => r.path !== `_local_/_local_/${currentProjectRef.current && currentProjectRef.current.project}`)
                            .map(
                                ((rep, n) => {
                                        return <>
                                            <Grid2 key={`${n}-name`} item size={4} sx={{backgroundColor: "#FFF"}}>
                                                <Stack>
                                                    <Box><b>{`${rep.name} (${rep.abbreviation})`}</b></Box>
                                                    {rep.description !== rep.name &&
                                                        <Box>{rep.description}</Box>
                                                    }
                                                </Stack>
                                            </Grid2>
                                            <Grid2 key={`${n}-language`} item size={1} sx={{backgroundColor: "#FFF"}}>
                                                {rep.language_code}
                                            </Grid2>
                                            <Grid2 key={`${n}-flavor`} item size={2} sx={{backgroundColor: "#FFF"}}>
                                                {rep.flavor}
                                            </Grid2>
                                            <Grid2 key={`${n}-source`} item size={2} sx={{backgroundColor: "#FFF"}}>
                                                {
                                                    rep.path.startsWith("_local_") ?
                                                        "Local" :
                                                        rep.path.split("/").slice(0, 2).join(" ")
                                                }
                                            </Grid2>
                                            <Grid2 key={`${n}-date`} item size={2} sx={{backgroundColor: "#FFF"}}>
                                                {dateFormat(rep.generated_date, "mmm d yyyy")}
                                            </Grid2>
                                            <Grid2 key={`${n}-actions`} item size={1} display="flex"
                                                   justifyContent="flex-end" alignItems="center"
                                                   sx={{backgroundColor: "#FFF"}}>
                                                <Checkbox
                                                    checked={selectedResources.includes(rep.path)}
                                                    onChange={
                                                        () => setSelectedResources(
                                                            selectedResources.includes(rep.path) ?
                                                                [...selectedResources].filter(s => s !== rep.path) :
                                                                [...selectedResources, rep.path]
                                                        )
                                                    }
                                                    inputProps={{'aria-label': 'controlled'}}
                                                />
                                            </Grid2>
                                        </>
                                    }
                                )
                            )
                    }
                </Grid2>
            </Box>
        </Box>
}

export default ConfigureWorkspace;
