import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider, Outlet } from "react-router-dom";
import { useState, useEffect, useContext } from "react";

import { Box, createTheme, ThemeProvider } from "@mui/material";
import { styled } from "@mui/material/styles";

import { SpaContainer, Header, typographyContext } from "pankosmia-rcl";

import { getAndSetJson } from "pankosmia-lib/http";

import { SnackbarProvider, MaterialDesignContent } from "notistack";

import ConfigureWorkspace from "./pages/ConfigureWorkspace/ConfigureWorkspace";
import Workspace from "./pages/Workspace/Workspace";

import "./index.css";

function AppLayout() {
  /*
   * Snackbar styling.
   */
  const CustomSnackbarContent = styled(MaterialDesignContent)(() => ({
    "&.notistack-MuiContent-error": {
      backgroundColor: "#FDEDED",
      color: "#D32F2F",
    },

    "&.notistack-MuiContent-info": {
      backgroundColor: "#E5F6FD",
      color: "#0288D1",
    },

    "&.notistack-MuiContent-warning": {
      backgroundColor: "#FFF4E5",
      color: "#EF6C00",
    },

    "&.notistack-MuiContent-success": {
      backgroundColor: "#EDF7ED",
      color: "#2E7D32",
    },
  }));

  return (
    <SnackbarProvider
      Components={{
        error: CustomSnackbarContent,
        info: CustomSnackbarContent,
        warning: CustomSnackbarContent,
        success: CustomSnackbarContent,
      }}
      maxSnack={6}
    >
      <Box className="my-wrapper">
        <Outlet />
      </Box>
    </SnackbarProvider>
  );
}

function AppRouter() {
  const [layout, setLayout] = useState("ViewEditorRightRow");

  const [selectedResources, setSelectedResources] = useState(new Set());

  const [selectedCrunchers, setSelectedCrunchers] = useState(new Set());

  const router = createHashRouter([
    {
      path: "/",
      element: <AppLayout />,
      children: [
        {
          index: true,
          element: (
            <ConfigureWorkspace
              layout={layout}
              setLayout={setLayout}
              selectedResources={selectedResources}
              setSelectedResources={setSelectedResources}
              selectedCrunchers={selectedCrunchers}
              setSelectedCrunchers={setSelectedCrunchers}
            />
          ),
        },

        {
          path: "workspace/*",
          element: (
            <Workspace
              layout={layout}
              setLayout={setLayout}
              selectedResources={selectedResources}
              selectedCrunchers={selectedCrunchers}
            />
          ),
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

function App() {
  return (
    <SpaContainer>
      <AppRouter />
    </SpaContainer>
  );
}

createRoot(document.getElementById("root")).render(<App />);
