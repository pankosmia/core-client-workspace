import { useContext, useEffect, useState, useCallback } from 'react';
import {useLocation} from "react-router-dom";
import {Box} from "@mui/material";
import WorkspaceCard from "./WorkspaceCard";
import BcvPicker from "./BcvPicker";
import GraphiteTest from "./GraphiteTest";
import {
    createTilePanes,
    TileContainer,
    TileProvider,
} from 'react-tile-pane'
import {Header} from "pithekos-lib";
import {typographyContext} from "pithekos-lib";
import OBSContext from '../../contexts/obsContext';

const paneStyle = {
    width: '100%',
    height: '100%',
    overflow: 'scroll'
}

const Workspace = () => {
    const { typographyRef } = useContext(typographyContext);
    const locationState = Object.entries(useLocation().state);
    const resources = locationState
        .map(kv => {
            return {...kv[1], local_path: kv[0]}
        })

    const tileElements = {};
    const rootPane = {
        children: [
            null,
            {
                children: [],
                isRow: true
            }
        ],
    }
    for (const resource of resources) {
        const title = resource.name;
        tileElements[title] = <WorkspaceCard
            metadata={resource}
            style={paneStyle}
        />;
        if (resource.primary) {
            rootPane.children[0] = {children: title};
        } else {
            rootPane.children[1].children.push({children: title});
        }
    }
    if (rootPane.children[1].children.length === 0) {
        rootPane.children.pop();
    }
    const paneList = createTilePanes(tileElements)[0];
    
    const isGraphite = GraphiteTest()
    /** adjSelectedFontClass reshapes selectedFontClass if Graphite is absent. */
    const adjSelectedFontClass = isGraphite ? typographyRef.current.font_set : typographyRef.current.font_set.replace(/Pankosmia-AwamiNastaliq(.*)Pankosmia-NotoNastaliqUrdu/ig, 'Pankosmia-NotoNastaliqUrdu');

    const [obs, setObs] = useState([1, 0]);

    return <>
        <Header
            titleKey="pages:core-local-workspace:title"
            requireNet={false}
            currentId="core-local-workspace"
            widget={<BcvPicker/>}
        />
        <div className={adjSelectedFontClass}>
          <OBSContext.Provider value={{obs, setObs}}  >
            <TileProvider
                tilePanes={paneList}
                rootNode={rootPane}
            >
            <Box style={{position: 'fixed', top: '48px', bottom: 0, right: 0, overflow: 'scroll', width: '100vw'}}>
                <TileContainer/>
            </Box>
            </TileProvider>
          </OBSContext.Provider>
        </div>
    </>
}
export default Workspace;
