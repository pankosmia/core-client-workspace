import React, {useState, useEffect, useContext} from "react";
import {useNavigate} from "react-router-dom";
import {Header, debugContext, i18nContext, currentProjectContext, getJson, doI18n} from "pithekos-lib";
import {Stack, Box, Typography, Checkbox, Fab, Card, CardContent, CardActionArea} from "@mui/material";
import { Masonry } from '@mui/lab';
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

    const heights = [30, 30, 30, 30, 30, 30];

/*      const Item = styled(Box)(({ theme }) => ({
        backgroundColor: '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(0.5),
        textAlign: 'center',
        color: (theme.vars || theme).palette.text.secondary,
        ...theme.applyStyles('dark', {
            backgroundColor: '#1A2027',
        }),
    })); */
 
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
                <Typography variant="h5" color='black' sx={{ paddingBottom: 5, paddingLeft: 6 }}>
                    {doI18n("pages:core-local-workspace:choose_resources", i18nRef.current)}
                </Typography>
                <Masonry
                    container
                    spacing={5}
                    columns={6}
                    sx={{ paddingLeft: 4, paddingRight: 4 }}
                >
                    {
                        repos
                            .filter(r => r.path !== `_local_/_local_/${currentProjectRef.current && currentProjectRef.current.project}`)
                            .map(
                                ((rep, n) => {
                                        return <Card>
                                            <CardActionArea 
                                                sx={{
                                                    height: 300,
                                                    width: 300,
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    flexDirection: 'column',
                                                    justifyContent: 'space-between',
                                                    p: 1,
                                                    m: 1,
                                                    position:'relative'
                                                  }}
                                                onClick={
                                                    () => setSelectedResources(
                                                        selectedResources.includes(rep.path) ?
                                                            [...selectedResources].filter(s => s !== rep.path) :
                                                            [...selectedResources, rep.path]
                                                    )
                                                }
                                            >
                                                <CardContent>
                                                        <Typography key={`${n}-name`}  sx={{ backgroudColor:"red" }} >
                                                            <Stack>
                                                                <Box><b>{`${rep.name} (${rep.abbreviation})`}</b></Box>
                                                                {rep.description !== rep.name &&
                                                                    <Box sx={{ height: 100, overflow:'auto'}}>{rep.description}</Box>
                                                                }
                                                            </Stack>
                                                        </Typography>
                                                        {/*  <Typography key={`${n}-flavor`}>
                                                                {rep.flavor}
                                                            </Typography> */}
                                                        {/* <Typography key={`${n}-source`}>
                                                            {
                                                                rep.path.startsWith("_local_") ?
                                                                    "Local" :
                                                                    rep.path.split("/").slice(0, 2).join(" ")
                                                            }
                                                        </Typography> */}
                                                        {/* <Typography key={`${n}-date`}>
                                                            {dateFormat(rep.generated_date, "mmm d yyyy")}
                                                        </Typography> */}
                                                        <Typography key={`${n}-language`} sx={{ position: 'absolute', bottom: 8, color: 'text.secondary', fontSize: 14 }}>
                                                            {`language: ${rep.language_code}`}
                                                        </Typography>
                                                        <Checkbox
                                                            disableRipple
                                                            sx={{ position: 'absolute', bottom: 0, left: 220 }}
                                                            checked={selectedResources.includes(rep.path)}
                                                            onChange={
                                                                () => setSelectedResources(
                                                                    selectedResources.includes(rep.path) ?
                                                                        [...selectedResources].filter(s => s !== rep.path) :
                                                                        [...selectedResources, rep.path]
                                                                )
                                                            }
                                                        />
                                                </CardContent>
                                            </CardActionArea>
                                        </Card>
                                    }
                                )
                            )
                    }
                </Masonry>
            </Box>
        </Box>
}

export default ConfigureWorkspace;
