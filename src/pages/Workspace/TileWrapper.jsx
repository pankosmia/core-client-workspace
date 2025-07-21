import { useCallback, useEffect, useState } from "react";
import WorkspaceCard from "./WorkspaceCard";
import {
    createTilePanes,
    TileContainer,
    TileProvider,
    useReset,
} from 'react-tile-pane';
import { Box, Button } from "@mui/material";

const paneStyle = {
    width: '100%',
    height: '100%',
    overflow: 'scroll'
}
function TileWrapper({ showResources, locationState }) {

    const [paneList, setPaneList] = useState(null);
    const [rootPane, setRootPane] = useState(null);
    const reset = useReset()

    console.log("showResources", showResources)
    const makeRootPane = (show) => {
        console.log("show", show)
        const resources = locationState
            .map(kv => {
                return { ...kv[1], local_path: kv[0] }
            })

        const tileElements = {};
        const newRootPane = {
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
                newRootPane.children[0] = { children: title };
            }
            else if (show) {
                newRootPane.children[1].children.push({ children: title });
            }
        }
        if (newRootPane.children[1].children.length === 0) {
            newRootPane.children.pop();
        }
        return [newRootPane, tileElements]
    }

    useEffect(() => {
        const [newRootPane, tileElements] = makeRootPane(showResources)
        setPaneList(createTilePanes(tileElements)[0]);
        setRootPane(newRootPane);
        console.log("ici useEffect tile Wrapper et showResources", showResources)
    }, [showResources])
    
    const doReset = useCallback(() => reset(rootPane), [showResources])
    doReset()

    const myConsole = (v) => {
        console.log("v", v)
        return v
    }

    if (!paneList || !rootPane) {
        return <p>Loading ... </p>
    }
    return (
        <>
            <TileProvider
                tilePanes={paneList}
                rootNode={rootPane}
            >
                <p>{myConsole(showResources)}</p>
                <Box style={{ position: 'fixed', top: '48px', bottom: 0, right: 0, overflow: 'scroll', width: '100vw' }}>
                    <TileContainer />
                </Box>
            </TileProvider>

        </>
    )
}

export default TileWrapper;