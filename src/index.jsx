import React, {useState} from 'react';
import {createRoot} from "react-dom/client";
import {SpaContainer} from "pithekos-lib";
import './index.css';
import {createHashRouter, RouterProvider} from "react-router-dom";
import ConfigureWorkspace from "./pages/ConfigureWorkspace/ConfigureWorkspace";
import Workspace from "./pages/Workspace/Workspace";

function App() {
    const [layout, setLayout] = useState("ViewEditorRightRow");
    const [selectedResources, setSelectedResources] = useState(new Set([]));

    console.log("router");

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

createRoot(document.getElementById("root"))
    .render(
       <App/>
    );
