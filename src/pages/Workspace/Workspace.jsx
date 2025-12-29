import { useContext, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Button, Chip, Stack } from "@mui/material";
import WorkspaceCard from "./WorkspaceCard";
import GraphiteTest from "./GraphiteTest";
import CenterFocusStrongOutlinedIcon from '@mui/icons-material/CenterFocusStrongOutlined';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import {
    createTilePanes,
    TileContainer,
    TileProvider,

} from 'react-tile-pane'
import { i18nContext, doI18n, Header } from "pithekos-lib";
import { typographyContext } from "pithekos-lib";
import OBSContext from '../../contexts/obsContext';
import layoutJson from './layouts';

const Workspace = ({ layout, setLayout }) => {
    const { i18nRef } = useContext(i18nContext);
    const { typographyRef } = useContext(typographyContext);
    const localisation = useLocation();
    const locationState = Object.entries(localisation.state ?? {});

    const resources = locationState
        .map(kv => {
            return { ...kv[1], local_path: kv[0] }
        });
    const [distractionModeCount, setDistractionModeCount] = useState(0);

    const [rootPane, tileElements] = layoutJson(resources, layout, i18nRef, distractionModeCount,locationState);
    const paneList = createTilePanes(tileElements)[0];

    const isGraphite = GraphiteTest()
    /** adjSelectedFontClass reshapes selectedFontClass if Graphite is absent. */
    const adjSelectedFontClass = isGraphite ? typographyRef.current.font_set : typographyRef.current.font_set.replace(/Pankosmia-AwamiNastaliq(.*)Pankosmia-NotoNastaliqUrdu/ig, 'Pankosmia-NotoNastaliqUrdu');

    const [obs, setObs] = useState([1, 0]);

    const DistractionToggle = ({ distractionModeCount, setDistractionModeCount }) => {
        return (
            <Stack sx={{ marginLeft: "1rem" }}  >
                <Chip
                    onClick={() => { setDistractionModeCount(distractionModeCount + 1); }}
                    icon={(distractionModeCount % 2) === 0 ? <CenterFocusStrongOutlinedIcon /> : <CenterFocusStrongIcon />}
                    label={`${doI18n("pages:core-local-workspace:focus_mode", i18nRef.current)}`}
                    color={(distractionModeCount % 2) === 0 ? "appbar-chip-inactive" : "secondary"}

                    variant="Filled"
                    disabled={resources.length === 1}
                />
            </Stack >
        )
    }

    return <>
        <Header
            titleKey="pages:core-local-workspace:title"
            requireNet={false}
            currentId="core-local-workspace"
            widget={<span style={{ display: "flex" }}>
                {["scripture", "parascriptural"].includes(resources.filter(r => r.primary)[0].flavor_type)}
                <DistractionToggle
                    distractionModeCount={distractionModeCount}
                    setDistractionModeCount={setDistractionModeCount} />
            </span>}
        />
        <div className={adjSelectedFontClass} id="fontWrapper"
        //key={flipTiles}
        >
            <OBSContext.Provider value={{ obs, setObs }}>
                <TileProvider
                    tilePanes={paneList}
                    rootNode={rootPane}
                >
                    <Box style={{
                        position: 'fixed',
                        top: '110px',
                        bottom: 0,
                        right: 0,
                        overflow: 'auto',
                        width: '100vw'
                    }}>
                        <TileContainer />
                    </Box>
                </TileProvider>
            </OBSContext.Provider>
        </div>
    </>
}
export default Workspace;
