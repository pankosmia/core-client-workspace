import React, {useState} from 'react';
import {SpaContainer} from "pithekos-lib";
import './index.css';
import {createHashRouter, RouterProvider} from "react-router-dom";
import ConfigureWorkspace from "./pages/ConfigureWorkspace/ConfigureWorkspace";
import Workspace from "./pages/Workspace/Workspace";

function App() {
    const [layout, setLayout] = useState("ViewEditorRightRow");
    const [selectedResources, setSelectedResources] = useState(new Set([]));
    return <Router
        layout={layout}
        setLayout={setLayout}
        selectedResources={selectedResources}
        setSelectedResources={setSelectedResources}
    />
}

function Router({layout, setLayout, selectedResources, setSelectedResources}) {
    const router = createHashRouter([
        {
            path: "/",
            element: <ConfigureWorkspace layout={layout} setLayout={setLayout} selectedResources={selectedResources} setSelectedResources={setSelectedResources} />
        },
        {
            path: "/workspace/*",
            element: <Workspace layout={layout} setLayout={setLayout} selectedResources={selectedResources}/>,
        }
    ]);

    return  <SpaContainer>
        <RouterProvider router={router}/>
    </SpaContainer>
}

export default App;