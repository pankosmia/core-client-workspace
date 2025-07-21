import { useContext, useEffect, useState, useCallback } from 'react';
import { useLocation } from "react-router-dom";
import { Box, Button } from "@mui/material";
import WorkspaceCard from "./WorkspaceCard";
import BcvPicker from "./BcvPicker";
import GraphiteTest from "./GraphiteTest";
import {
    createTilePanes,
    TileContainer,
    TileProvider,
    useReset,
} from 'react-tile-pane'
import { Header } from "pithekos-lib";
import { typographyContext } from "pithekos-lib";
import OBSContext from '../../contexts/obsContext';
import TileWrapper from './TileWrapper';


const Workspace = () => {
    console.log("workspace")
    const { typographyRef } = useContext(typographyContext);
    const locationState = Object.entries(useLocation().state);
    const [showResources, setShowResources] = useState(true);
    const [obs, setObs] = useState([1, 0]);

    const isGraphite = GraphiteTest()
    /** adjSelectedFontClass reshapes selectedFontClass if Graphite is absent. */
    const adjSelectedFontClass = isGraphite ? typographyRef.current.font_set : typographyRef.current.font_set.replace(/Pankosmia-AwamiNastaliq(.*)Pankosmia-NotoNastaliqUrdu/ig, 'Pankosmia-NotoNastaliqUrdu');

    const handleClick = () => {
        setShowResources(!showResources);
        console.log("handleCLick")
    }

    return <>
        <Header
            titleKey="pages:core-local-workspace:title"
            requireNet={false}
            currentId="core-local-workspace"
            widget={<BcvPicker />}
        />
        <div className={adjSelectedFontClass} >
            <OBSContext.Provider value={{ obs, setObs }}  >
                <TileWrapper showResources={showResources} locationState={locationState} />
            </OBSContext.Provider>
        </div>
        <Button onClick={handleClick}>
            Test bouton
        </Button>
    </>
}
export default Workspace;
