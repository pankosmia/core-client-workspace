import React from 'react';
import {createRoot} from "react-dom/client";
import {SpaContainer} from "pithekos-lib";
import './index.css';
import {createHashRouter, RouterProvider} from "react-router-dom";
import ConfigureWorkspace from "./pages/ConfigureWorkspace/ConfigureWorkspace";
import Workspace from "./pages/Workspace/Workspace";

const router = createHashRouter([
    {
        path: "/",
        element: <ConfigureWorkspace/>,
    },
    {
        path: "/workspace/*",
        element: <Workspace/>,
    }
]);

createRoot(document.getElementById("root"))
    .render(
        <SpaContainer>
            <RouterProvider router={router}/>
        </SpaContainer>
    );