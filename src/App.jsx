import React, { useState, useEffect } from "react";
import "./index.css";
import { createHashRouter, RouterProvider } from "react-router-dom";
import ConfigureWorkspace from "./pages/ConfigureWorkspace/ConfigureWorkspace";
import Workspace from "./pages/Workspace/Workspace";
import { SpaContainer } from "pankosmia-rcl";
import { createTheme, ThemeProvider, styled } from "@mui/material";
import { getAndSetJson } from "pithekos-lib";
import { SnackbarProvider, MaterialDesignContent } from "notistack";
function App() {
  const [layout, setLayout] = useState("ViewEditorRightRow");
  const [selectedResources, setSelectedResources] = useState(new Set([]));

  return (
    <Router
      layout={layout}
      setLayout={setLayout}
      selectedResources={selectedResources}
      setSelectedResources={setSelectedResources}
    />
  );
}

function Router({
  layout,
  setLayout,
  selectedResources,
  setSelectedResources,
}) {
  const [themeSpec, setThemeSpec] = useState({
    palette: {
      primary: {
        main: "#666",
      },
      secondary: {
        main: "#888",
      },
    },
  });
  useEffect(() => {
    if (
      themeSpec.palette &&
      themeSpec.palette.primary &&
      themeSpec.palette.primary.main &&
      themeSpec.palette.primary.main === "#666"
    ) {
      getAndSetJson({
        url: "/app-resources/themes/default.json",
        setter: setThemeSpec,
      }).then();
    }
  });
  const theme = createTheme(themeSpec);
  const router = createHashRouter([
    {
      path: "/",
      element: (
        <ConfigureWorkspace
          layout={layout}
          setLayout={setLayout}
          selectedResources={selectedResources}
          setSelectedResources={setSelectedResources}
        />
      ),
    },
    {
      path: "/workspace/*",
      element: (
        <Workspace
          layout={layout}
          setLayout={setLayout}
          selectedResources={selectedResources}
        />
      ),
    },
  ]);
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
    <ThemeProvider theme={theme}>
      <SnackbarProvider
        Components={{
          error: CustomSnackbarContent,
          info: CustomSnackbarContent,
          warning: CustomSnackbarContent,
          success: CustomSnackbarContent,
        }}
        maxSnack={6}
      >
        <SpaContainer>
          <RouterProvider router={router} />
        </SpaContainer>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
