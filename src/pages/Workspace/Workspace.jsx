import { useContext, useState, useEffect } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import GraphiteTest from "./GraphiteTest";
import { createTilePanes, TileContainer, TileProvider } from "react-tile-pane";
import { getJson } from "pankosmia-lib/http";
import { doI18n } from "pankosmia-lib/i18n";
import OBSContext from "../../contexts/obsContext";
import layoutJson from "./layouts";
import {
  i18nContext,
  currentProjectContext,
  debugContext,
  Header,
  typographyContext,
  productContext as ProductContext,
} from "pankosmia-rcl";

const Workspace = ({ layout, selectedResources, selectedCrunchers }) => {
  const { i18nRef } = useContext(i18nContext);
  const { typographyRef } = useContext(typographyContext);
  const { currentProjectRef } = useContext(currentProjectContext);
  const { debugRef } = useContext(debugContext);
  const { product } = useContext(ProductContext);
  const [resourceDetails, setResourceDetails] = useState({});
  const [projectSummaries, setProjectSummaries] = useState({});
  const [distractionModeCount, setDistractionModeCount] = useState(0);
  const [obs, setObs] = useState([1, 0]);

  const getProjectSummaries = async () => {
    const summariesResponse = await getJson(
      "/api/burrito/metadata/summaries",
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
    selectedCrunchers,
    layout,
    i18nRef,
    distractionModeCount,
  );
  const paneList = createTilePanes(tileElements)[0];

  return (
    <>
      <style>{`
        .react-tile-pane-tabBar {
          overflow: hidden;
        }
        .react-tile-pane-tab {
          min-width: 0 !important;
          overflow: hidden;
          flex-shrink: 1;
        }
        .react-tile-pane-tabInnerOff,
        .react-tile-pane-tabInnerOn {
          min-width: 0;
          overflow: hidden;
        }
        .react-tile-pane-tabTitle {
          display: block;
          width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center !important;
          text-align-last: center !important;
        }
        .react-tile-pane-off {
          display: none !important;
        }
      `}</style>
      <Header
        titleKey="pages:core-local-workspace:title"
        requireNet={false}
        currentId="core-local-workspace"
      />
      <div className={adjSelectedFontClass} id="fontWrapper">
        <OBSContext.Provider value={{ obs, setObs }}>
          <TileProvider tilePanes={paneList} rootNode={rootPane}>
            <Box
              style={{
                position: "fixed",
                top: product && product.os === "android" ? "180px" : "110px",
                width:
                  product && product.os === "android"
                    ? "calc(100% - 60px)"
                    : "100%",
                left: product && product.os === "android" ? "30px" : 0,
                bottom: product && product.os === "android" ? "30px" : 0,
                right: product && product.os === "android" ? "30px" : 0,
                overflow: "auto",
                /* width: "100vw", */
              }}
              onMouseOver={(e) => {
                if (
                  e.target.classList.contains("react-tile-pane-tabTitle") &&
                  !e.target.title
                ) {
                  e.target.title = e.target.textContent;
                }
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
