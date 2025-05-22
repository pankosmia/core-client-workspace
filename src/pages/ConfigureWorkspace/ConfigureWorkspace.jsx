import React, {useState, useEffect, useContext} from "react";
import {useNavigate} from "react-router-dom";
import {Header, debugContext, i18nContext, currentProjectContext, getJson, doI18n} from "pithekos-lib";
import {Grid2, Stack, Box, Typography, Checkbox, Fab, Masonry} from "@mui/material";
import { styled } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import dateFormat from 'dateformat';

function ConfigureWorkspace() {
    const [repos, setRepos] = useState([]);
    const {debugRef} = useContext(debugContext);
    const {i18nRef} = useContext(i18nContext);
    const {currentProjectRef} = useContext(currentProjectContext);

    const [selectedResources, setSelectedResources] = useState([]);

    const navigate = useNavigate();

    const Item = styled(Paper)(({ theme }) => ({
        backgroundColor: '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(0.5),
        textAlign: 'center',
        color: (theme.vars || theme).palette.text.secondary,
        ...theme.applyStyles('dark', {
            backgroundColor: '#1A2027',
        }),
    }));

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
            <Box style={{position: 'fixed', width: '100%'}}>
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
            </Box>
            <Box style={{position: 'fixed', top: '105px', bottom: 0, overflow: 'scroll', marginBottom: "16px", width: '100%'}}>
                <Masonry
                    container
                    spacing={1}
                    columns={1}
                    sx={{
                        ml: "16px",
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
                    <Item sx={ 2 }>
                        <Typography variant="h6">
                            {doI18n("pages:core-local-workspace:choose_resources", i18nRef.current)}
                        </Typography>
                    </Item>
                    {
                        repos
                            .filter(r => r.path !== `_local_/_local_/${currentProjectRef.current && currentProjectRef.current.project}`)
                            .map(
                                ((rep, n) => {
                                        return <>
                                            <Item key={`${n}-name`} sx={ 4 }>
                                                <Stack>
                                                    <Box><b>{`${rep.name} (${rep.abbreviation})`}</b></Box>
                                                    {rep.description !== rep.name &&
                                                        <Box>{rep.description}</Box>
                                                    }
                                                </Stack>
                                            </Item>
                                            <Item key={`${n}-language`} sx={ 1 }>
                                                {rep.language_code}
                                            </Item>
                                            <Item key={`${n}-flavor`} sx={ 2 }>
                                                {rep.flavor}
                                            </Item>
                                            <Item key={`${n}-source`} sx={ 2 }>
                                                {
                                                    rep.path.startsWith("_local_") ?
                                                        "Local" :
                                                        rep.path.split("/").slice(0, 2).join(" ")
                                                }
                                            </Item>
                                            <Item key={`${n}-date`} sx={ 2 }>
                                                {dateFormat(rep.generated_date, "mmm d yyyy")}
                                            </Item>
                                            <Item key={`${n}-actions`} sx={ 1 } display="flex"
                                                   justifyContent="flex-end" alignItems="center"
                                                   >
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
                                            </Item>
                                        </>
                                    }
                                )
                            )
                    }
                </Masonry>
            </Box>
        </Box>
}

export default ConfigureWorkspace;
