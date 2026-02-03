import { useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Box, Chip, Stack, Typography } from "@mui/material";
import GraphiteTest from "./GraphiteTest";
import CenterFocusStrongOutlinedIcon from "@mui/icons-material/CenterFocusStrongOutlined";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import { createTilePanes, TileContainer, TileProvider } from "react-tile-pane";
import { getJson, doI18n } from "pithekos-lib";
import OBSContext from "../../contexts/obsContext";
import layoutJson from "./layouts";
import {
  i18nContext,
  currentProjectContext,
  debugContext,
  Header,
  typographyContext,
} from "pankosmia-rcl";

const Workspace = ({ layout, selectedResources }) => {
  const { i18nRef } = useContext(i18nContext);
  const { typographyRef } = useContext(typographyContext);
  const { currentProjectRef } = useContext(currentProjectContext);
  const { debugRef } = useContext(debugContext);
  const [resourceDetails, setResourceDetails] = useState({});
  const [projectSummaries, setProjectSummaries] = useState({});
  const [distractionModeCount, setDistractionModeCount] = useState(0);
  const [obs, setObs] = useState([1, 0]);

  const getProjectSummaries = async () => {
    const summariesResponse = await getJson(
      "/burrito/metadata/summaries",
      debugRef.current,
    );
    if (summariesResponse.ok) {
      setProjectSummaries(summariesResponse.json);
    }
  };

  useEffect(() => {
    getProjectSummaries().then();
  }, []);

  useEffect(() => {
    if (currentProjectRef.current && Object.keys(projectSummaries).length > 0) {
      let newResourceDetails = Object.entries(projectSummaries)
        .map((ent) => {
          return { ...ent[1], local_path: ent[0] };
        })
        .map((r) => [r.local_path, r])
        .filter(
          (re) =>
            selectedResources.has(re[0]) ||
            (currentProjectRef.current &&
              re[0] === Object.values(currentProjectRef.current).join("/")),
        )
        .map((re) =>
          currentProjectRef.current &&
          re[0] === Object.values(currentProjectRef.current).join("/")
            ? [
                re[0],
                {
                  ...re[1],
                  primary: true,
                },
              ]
            : re,
        );
      setResourceDetails(Object.fromEntries(newResourceDetails));
    }
  }, [selectedResources, projectSummaries]);

  const isGraphite = GraphiteTest();
  /** adjSelectedFontClass reshapes selectedFontClass if Graphite is absent. */
  const adjSelectedFontClass = isGraphite
    ? typographyRef.current.font_set
    : typographyRef.current.font_set.replace(
        /Pankosmia-AwamiNastaliq(.*)Pankosmia-NotoNastaliqUrdu/gi,
        "Pankosmia-NotoNastaliqUrdu",
      );

  if (Object.keys(resourceDetails).length === 0) {
    return <Typography>Loading...</Typography>;
  }

  const [rootPane, tileElements] = layoutJson(
    resourceDetails,
    layout,
    i18nRef,
    distractionModeCount,
  );
  const paneList = createTilePanes(tileElements)[0];

  const DistractionToggle = ({
    distractionModeCount,
    setDistractionModeCount,
  }) => {
    return (
      <Stack sx={{ marginLeft: "1rem" }}>
        <Chip
          onClick={() => {
            setDistractionModeCount(distractionModeCount + 1);
          }}
          icon={
            distractionModeCount % 2 === 0 ? (
              <CenterFocusStrongOutlinedIcon />
            ) : (
              <CenterFocusStrongIcon />
            )
          }
          label={`${doI18n("pages:core-local-workspace:focus_mode", i18nRef.current)}`}
          color={
            distractionModeCount % 2 === 0
              ? "appbar-chip-inactive"
              : "secondary"
          }
          variant="Filled"
          disabled={Object.keys(resourceDetails).length === 1}
        />
      </Stack>
    );
  };

  return (
    <>
      <Header
        titleKey="pages:core-local-workspace:title"
        requireNet={false}
        currentId="core-local-workspace"
        widget={
          <span style={{ display: "flex" }}>
            {["scripture", "parascriptural"].includes(
              Object.values(resourceDetails).filter((r) => r.primary)[0]
                .flavor_type,
            )}
            <DistractionToggle
              distractionModeCount={distractionModeCount}
              setDistractionModeCount={setDistractionModeCount}
            />
          </span>
        }
      />
      <div className={adjSelectedFontClass} id="fontWrapper">
        <OBSContext.Provider value={{ obs, setObs }}>
          <TileProvider tilePanes={paneList} rootNode={rootPane}>
            <Box
              style={{
                position: "fixed",
                top: "110px",
                bottom: 0,
                right: 0,
                overflow: "auto",
                width: "100vw",
              }}
            >
              <TileContainer />
            </Box>
          </TileProvider>
        </OBSContext.Provider>
      </div>
    </>
  );
};
export default Workspace;
