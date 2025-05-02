import React, {useState, useEffect, useContext, useCallback} from "react";
import {useNavigate} from "react-router-dom";
import {Header, debugContext, i18nContext, currentProjectContext, getJson, doI18n} from "pithekos-lib";
import {Grid2, IconButton, Stack, Box, Typography, Checkbox} from "@mui/material";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import dateFormat from 'dateformat';

function ConfigureWorkspace() {
    const [repos, setRepos] = useState([]);
    const {debugRef} = useContext(debugContext);
    const {i18nRef} = useContext(i18nContext);
    const {currentProjectRef} = useContext(currentProjectContext);

    const [maxWindowHeight, setMaxWindowHeight] = useState(window.innerHeight - 80);
    const [selectedResources, setSelectedResources] = useState([]);

    const navigate = useNavigate();

    const handleWindowResize = useCallback(() => {
            setMaxWindowHeight(window.innerHeight - 80);
        }
    );

    useEffect(() => {
        window.addEventListener('resize', handleWindowResize);
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, [handleWindowResize]);

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
            <Header
                titleKey="pages:core-local-workspace:title"
                requireNet={false}
                currentId="core-local-workspace"
            />
            <Box sx={{p: 1, backgroundColor: "#EEE", maxHeight: maxWindowHeight}}>
                <Grid2 container spacing={1} sx={{backgroundColor: "#EEE"}}>
                    <Grid2 item size={11} sx={{backgroundColor: "#FFF"}}>
                        <Typography variant="h5">
                            {`${doI18n("pages:core-local-workspace:editing", i18nRef.current, debugRef.current)} ${currentProjectRef.current && currentProjectRef.current.project}`}
                        </Typography>
                    </Grid2>
                    <Grid2 item size={1}  display="flex" justifyContent="flex-end" alignItems="center" sx={{backgroundColor: "#FFF"}}>
                        <IconButton
                            onClick={
                                (e) => {
                                    console.log(currentProjectRef.current);
                                    let stateEntries = repos
                                        .map(r => [r.path, r])
                                        .filter(re => selectedResources.includes(re[0]) || (currentProjectRef.current && re[0] === Object.values(currentProjectRef.current).join("/")))
                                        .map(re => (currentProjectRef.current && re[0] === Object.values(currentProjectRef.current).join("/")) ? [re[0], {...re[1], primary: true}]: re)
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
                            <PlayArrowIcon/>
                        </IconButton>
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
