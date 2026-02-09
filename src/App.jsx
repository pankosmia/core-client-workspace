import React, { useState, useEffect } from "react";
import "./index.css";
import { createHashRouter, RouterProvider } from "react-router-dom";
import ConfigureWorkspace from "./pages/ConfigureWorkspace/ConfigureWorkspace";
import Workspace from "./pages/Workspace/Workspace";
import { SpaContainer } from "pankosmia-rcl";
import { createTheme, ThemeProvider } from "@mui/material";
import { getAndSetJson } from "pithekos-lib";
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

  return (
    <ThemeProvider theme={theme}>
      <SpaContainer>
        <RouterProvider router={router} />
      </SpaContainer>
    </ThemeProvider>
  );
}

export default App;
