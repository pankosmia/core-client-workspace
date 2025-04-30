import React, { useContext } from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import WorkspaceCard from "./WorkspaceCard";
import BcvPicker from "./BcvPicker";
import ArrowBack from "@mui/icons-material/ArrowBack";
import {Box} from "@mui/material";
import {
    createTilePanes,
    TileContainer,
    TileProvider,
} from 'react-tile-pane'
import {Header} from "pithekos-lib";
import {IconButton} from "@mui/material";
import {typographyContext} from "pithekos-lib";

const paneStyle = {
    width: '100%',
    height: '100%',
    overflow: 'scroll'
}

const BackToProjects = () => {
    const navigate = useNavigate();
    return <IconButton
        sx={{"color": "#FFF", m:0}}
        onClick={
            (e) => {
                navigate("/");
                e.stopPropagation();
            }
        }
    >
        <ArrowBack/>
    </IconButton>

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

    const selectedFontClass = typographyRef.current.font_set;

    return <>
        <Header
            titleKey="pages:core-local-workspace:title"
            requireNet={false}
            currentId="core-local-workspace"
            widget={<BcvPicker/>}
        />
        <div className={selectedFontClass}>
          <TileProvider
              tilePanes={paneList}
              rootNode={rootPane}
          >
              <div style={{width: '100vw', height: '100vh'}}>
                  <TileContainer/>
              </div>
          </TileProvider>
        </div>
    </>
}
export default Workspace;
