import { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getJson, doI18n } from "pithekos-lib";
import {
  debugContext,
  i18nContext,
  currentProjectContext,
  Header
} from "pankosmia-rcl";

import {
    Box,
    Typography,
    Fab,
    Grid2,
    DialogContent,
    useTheme,
} from "@mui/material";
import { PanDialog, PanTable } from 'pankosmia-rcl';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import LayoutPicker from "./WorkspaceLayoutButton";

function ConfigureWorkspace({ layout, setLayout, selectedResources, setSelectedResources }) {

    const { debugRef } = useContext(debugContext);
    const { i18nRef } = useContext(i18nContext);
    const { currentProjectRef } = useContext(currentProjectContext);
    const [open, setOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const [projectSummaries, setProjectSummaries] = useState({});
    const [isoOneToThreeLookup, setIsoOneToThreeLookup] = useState([]);
    const [isoThreeLookup, setIsoThreeLookup] = useState([]);
    const [alignment, setAlignment] = useState(selectedResources.size === 0 ? "" : layout);
    const theme= useTheme();
    const [contentBooks, setContentBooks] = useState();

    const getProjectSummaries = async () => {
        const summariesResponse = await getJson("/burrito/metadata/summaries", debugRef.current);
        if (summariesResponse.ok) {
            setProjectSummaries(summariesResponse.json);
        }
    }

  useEffect(() => {
    getProjectSummaries().then();
  }, []);

  const handleNext = async () => {
    setOpen(false);
    const params = new URLSearchParams(location.search);
    const returnPage = params.get("return-page");
    if (returnPage === "workspace") {
      navigate("/workspace");
    } else {
      window.location.replace("/clients/content");
    }
  };


  useEffect(() => {
    fetch("/app-resources/lookups/iso639-1-to-3.json") // ISO_639-1 codes mapped to ISO_639-3 codes
      .then((r) => r.json())
      .then((data) => setIsoOneToThreeLookup(data));
  }, []);

  useEffect(() => {
    fetch("/app-resources/lookups/iso639-3.json") // ISO_639-3 2025-02-21 from https://hisregistries.org/rol/ plus zht, zhs, nep
      .then((r) => r.json())
      .then((data) => setIsoThreeLookup(data));
  }, []);

  useEffect(() => {
    const getProjectBooks = async () => {
      if (currentProjectRef.current) {
        const projectPath = `${currentProjectRef.current.source}/${currentProjectRef.current.organization}/${currentProjectRef.current.project}`;
        const fullMetadataResponse = await getJson(
          `/burrito/metadata/summary/${projectPath}`,
          debugRef.current,
        );
        if (fullMetadataResponse.ok) {
          console.log(fullMetadataResponse.json);
          setContentBooks(new Set(fullMetadataResponse.json.book_codes));
        }
        if (!fullMetadataResponse.ok) {
          fullMetadataResponse.json
        }
      }
    };
    getProjectBooks().then();
  }, [currentProjectRef.current]);

  const projectFlavors = {
    textTranslation: "myBcvList",
    audioTranslation: "myBcvList",
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
    textStories: "myObsList",
    "x-obsimages": [],
    "x-obsarticles": "myObsList",
    "x-obsquestions": "myObsList",
    "x-obsnotes": "myObsList",
    "x-translationplan": "myBcvList",
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

    const columns = useMemo(() => [
        {
            field: 'name',
            headerName: doI18n("pages:core-local-workspace:row_name", i18nRef.current),
            flex: 1
        },
        {
            field: 'description',
            headerName: doI18n("pages:core-local-workspace:row_description", i18nRef.current),
            flex: 1
        },
        {
            field: 'source',
            headerName: doI18n('pages:core-local-workspace:row_source', i18nRef.current),
            flex: 0.5,
        },
        {
            field: 'type',
            headerName: doI18n("pages:core-local-workspace:row_type", i18nRef.current),
            flex: 0.4
        },
        {
            field: 'language',
            headerName: doI18n("pages:core-local-workspace:row_language", i18nRef.current),
            flex: 0.5
        }
    ], [i18nRef.current]);

    const rows = useMemo(() => {
        return Object.entries(projectSummaries)
          .map(e => {
              return { ...e[1], path: e[0] }
          })
          .filter((r) => currentProjectRef.current && projectFlavors[projectSummaries[r.path].flavor] === projectFlavors[projectSummaries[`_local_/_local_/${currentProjectRef.current.project}`].flavor])
          .filter(r => r.path !== `_local_/_local_/${currentProjectRef.current && currentProjectRef.current.project}`)
          .filter(r => !contentBooks || contentBooks.size === 0 || new Set(r.book_codes).intersection(contentBooks).size > 0)
          .map((rep, n) => {
              return {
                  ...rep,
                  id: n.toString(),
                  name: `${rep.name} (${rep.abbreviation})`,
                  description: rep.description !== rep.name ? rep.description : "",
                  source: rep.path.startsWith('_local_')
                      ? rep.path.startsWith('_local_/_sideloaded_')
                          ? doI18n('pages:content:local_resource', i18nRef.current)
                          : doI18n('pages:content:local_project', i18nRef.current)
                      : `${rep.path.split('/')[1]} (${rep.path.split('/')[0]})`,
                  type: rep.flavor,
                  language: isoThreeLookup?.[isoOneToThreeLookup[rep.language_code] ?? rep.language_code]?.en ??
                      rep.language_code
              }
          })
        }
      , [contentBooks]);

  /**
   * Important: These are precise calculations given the state of this component at the time this was set up.
   *              The grid height plus all other elements in the dialog fit inside the PanDialog height.
   *                 This prevents PanDialog from getting an extra, unwanted scrollbar.
   *                    Scrolling is inside the DataGrid with a sticky header.
   *      Wrap beyond the 48px height of the "display options row" is also prevented to avoid unwanted PanDialog scrolling.
   * Reduce inner hight as follows to get the correct DataGrid height:
   * - 64px Less PanDialog's default is `max-height: calc(100% - 64px);` (which corresponds to its surrounding 32px margins default)
   * - 64px Less PanDialog's header
   * - 20px Less Top Padding
   * - 48px Less Display options row
   * - 16px Less Margin
   *      -> Grid is here. In this case the Pagination row is included in the grid height
   * - 20px Less Bottom Padding
   * - 16px Less Bottom Margin
   *  ------
   *   248px This is the minimum amount by which to reduce the innerHeight (const adjustment)
   */
  const adjustment = 248;

  const [maxWindowHeight, setMaxWindowHeight] = useState(
    window.innerHeight - adjustment,
  );

  const handleWindowResize = useCallback(() => {
    setMaxWindowHeight(window.innerHeight - adjustment);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [handleWindowResize]);

    return Object.keys(i18nRef.current).length === 0 ?
        <p>...</p> :
        <Box
            sx={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backgroundSize: "cover",
                backgroundPosition: "center",
                zIndex: -1,
                backgroundImage:
                    'url("/app-resources/pages/content/background_blur.png")',
                backgroundRepeat: "no-repeat",
                backdropFilter: "blur(3px)",
            }}
        >
            <Box style={{ position: 'static' }}>
                <Header
                    titleKey="pages:core-local-workspace:title"
                    requireNet={false}
                    currentId="core-local-workspace"
                />
            </Box>
            <PanDialog
                titleLabel={`${doI18n("pages:core-local-workspace:Select_Resources", i18nRef.current, debugRef.current)}`}
                isOpen={open}
                closeFn={() => handleNext()}
                size="xl"
                theme={theme}
            >
                <DialogContent>
                    <Grid2
                        sx={{ display: 'flex', flexFlow: 'row nowrap' }}
                        container
                        alignItems="center"
                        justifyContent="space-between"
                        width="100%"
                    >
                        <Grid2 display="flex" gap={1}>
                            <Typography
                              sx={{
                                overflow: 'hide',
                                maxHeight: 48,
                              }}
                            >
                              {doI18n("pages:core-local-workspace:choose_resources_workspace", i18nRef.current)}
                            </Typography>

                        </Grid2>
                       <LayoutPicker layout={layout} setLayout={setLayout} selectedResources={selectedResources}/>
                        <Grid2
                            display="flex"
                            gap={1}
                        >
                            <Fab
                                variant="extended"
                                color="primary"
                                length="small"
                                aria-label={doI18n("pages:content:add", i18nRef.current)}
                                onClick={
                                    (e) => {
                                        let stateEntries = Object.entries(projectSummaries)
                                            .map(e => {
                                                return { ...e[1], path: e[0] }
                                            })
                                            .map(r => [r.path, r])
                                            .filter(re => selectedResources.has(re[0]) || (currentProjectRef.current && re[0] === Object.values(currentProjectRef.current).join("/")))
                                            .map(re => (currentProjectRef.current && re[0] === Object.values(currentProjectRef.current).join("/")) ? [re[0], {
                                                ...re[1],
                                                primary: true
                                            }] : re)
                                        navigate(
                                            "/workspace",
                                            {
                                                state: Object.fromEntries(stateEntries),
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
                    <Box sx={{ m: 2 }}>
                      <Grid2 item size={12}>
                        <Box
                          sx={{
                            height: `${maxWindowHeight}px`,
                            display: "flex",
                            flexDirection: "column",
                            width: "100%",
                          }}
                        >
                          <Box sx={{ flex: 1, minHeight: 0 }}>
                            <PanTable
                                checkboxSelection
                                showColumnFilters
                                theme={theme}
                                rows={rows}
                                columns={columns}
                                onRowSelectionModelChange={(ids) => {
                                    const paths = rows.filter(r => ids.includes(r.id)).map(r => r.path);
                                    setSelectedResources(new Set(paths));
                                }}
                                sx={{
                                    fontSize: "1rem",
                                    height: "100%",
                                    "& .MuiTable-root": { height: "100%" }, 
                                    "& .MuiTableCell-head": { 
                                      position: "sticky",
                                      top: 0,
                                      zIndex: 2,
                                      backgroundColor: "background.paper",
                                    },
                                  }}
                            />
                          </Box>
                        </Box>
                      </Grid2>
                    </Box>
                </DialogContent>
            </PanDialog>
        </Box>
}

export default ConfigureWorkspace;
