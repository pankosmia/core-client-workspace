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
  const { typographyRef } = useContext(typographyContext);

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

  const [fontFamily, setFontFamily] = useState("");
  const [fontFamilyCorrespondance, setFontFamilyCorrespondance] =
    useState(null);
  const [theme, setTheme] = useState(null);

  /*
   * Load the default Pankosmia theme.
   */
  useEffect(() => {
    if (themeSpec?.palette?.primary?.main === "#666") {
      getAndSetJson({
        url: "/api/app-resources/themes/default.json",
        setter: setThemeSpec,
      }).then();
    }
  }, []);

  /*
   * Get the fonts available in the browser.
   */
  useEffect(() => {
    let cores = {};

    document.fonts.ready.then(() => {
      document.fonts.forEach((font) => {
        const cleanFamily = font.family
          .replace(/['"]/g, "")
          .trim()
          .replace(/\s+/g, " ");

        cores[cleanFamily.replaceAll(" ", "")] = cleanFamily;
      });

      setFontFamilyCorrespondance(cores);
    });
  }, []);

  /*
   * Match Pankosmia typography fonts with
   * fonts available in the browser.
   */
  useEffect(() => {
    if (!fontFamilyCorrespondance || !typographyRef.current?.font_set) {
      return;
    }

    let table = typographyRef.current.font_set.split("Pankosmia");

    table.shift();

    table = table.map((e) => "Pankosmia" + e);

    const newFont = {};

    Object.entries(fontFamilyCorrespondance).forEach(([key, value]) => {
      const index = table.indexOf(key);

      if (index >= 0) {
        newFont[index] = value;
      }
    });

    const fonts = [];

    for (let i = 0; i < table.length; i++) {
      if (newFont[i]) {
        fonts.push(newFont[i]);
      }
    }

    setFontFamily(fonts);
  }, [typographyRef.current?.font_set, fontFamilyCorrespondance]);

  /*
   * Create the MUI theme.
   */
  useEffect(() => {
    if (!fontFamily?.length) {
      return;
    }

    const font = fontFamily.join(",");

    const style = document.createElement("style");

    style.innerHTML = `
    html,
    body {
      margin: 0;
      padding: 0;
      font-family: ${font} !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      overflow: hidden;
    }

    *,
    *::before,
    *::after {
      font-family: inherit !important;
    }
  `;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [fontFamily]);
  useEffect(() => {
    if (!themeSpec || !fontFamily?.length) {
      return;
    }

    const font = fontFamily.join(",");

    setTheme(
      createTheme({
        ...themeSpec,

        typography: {
          ...themeSpec.typography,
          fontFamily: font,
        },

        components: {
          ...themeSpec.components,

          MuiCssBaseline: {
            styleOverrides: {
              body: {
                fontFamily: font,
              },

              "*": {
                fontFamily: "inherit",
              },

              "button, input, textarea, select": {
                fontFamily: font,
              },
            },
          },

          MuiTypography: {
            styleOverrides: {
              root: {
                fontFamily: font,
              },
            },
          },

          MuiListItemText: {
            styleOverrides: {
              primary: {
                fontFamily: font,
              },
              secondary: {
                fontFamily: font,
              },
            },
          },

          MuiButton: {
            styleOverrides: {
              root: {
                fontFamily: font,
              },
            },
          },

          MuiInputBase: {
            styleOverrides: {
              root: {
                fontFamily: font,
              },
              input: {
                fontFamily: font,
              },
            },
          },

          MuiInputLabel: {
            styleOverrides: {
              root: {
                fontFamily: font,
              },
            },
          },

          MuiFormLabel: {
            styleOverrides: {
              root: {
                fontFamily: font,
              },
            },
          },

          MuiFormHelperText: {
            styleOverrides: {
              root: {
                fontFamily: font,
              },
            },
          },

          MuiMenuItem: {
            styleOverrides: {
              root: {
                fontFamily: font,
              },
            },
          },

          MuiSelect: {
            styleOverrides: {
              select: {
                fontFamily: font,
              },
            },
          },

          MuiChip: {
            styleOverrides: {
              label: {
                fontFamily: font,
              },
            },
          },

          MuiTab: {
            styleOverrides: {
              root: {
                fontFamily: font,
              },
            },
          },

          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                fontFamily: font,
              },
            },
          },

          MuiDialogTitle: {
            styleOverrides: {
              root: {
                fontFamily: font,
              },
            },
          },

          MuiDialogContentText: {
            styleOverrides: {
              root: {
                fontFamily: font,
              },
            },
          },

          MuiTableCell: {
            styleOverrides: {
              root: {
                fontFamily: font,
              },
            },
          },
        },
      }),
    );
  }, [themeSpec, fontFamily]);

  /*
   * Set global CSS variables.
   */
  useEffect(() => {
    if (!theme) {
      return;
    }

    document.body.style.setProperty(
      "--accent-color-dark",
      theme.palette.primary.main,
    );

    document.body.style.setProperty("--background-color-light", "#ffffff");
  }, [theme]);

  /*
   * Make sure MUI Typography uses the
   * configured Pankosmia fonts.
   */
  useEffect(() => {
    if (!fontFamily?.length) {
      return;
    }

    const style = document.createElement("style");

    style.innerHTML = `
      .MuiTypography-root {
        font-family: ${fontFamily.join(",")} !important;
      }
    `;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [fontFamily]);

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

  /*
   * Wait until the theme is ready.
   */
  if (!theme) {
    return null;
  }

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
      <ThemeProvider theme={theme}>
        <Box className="my-wrapper">
          <Outlet />
        </Box>
      </ThemeProvider>
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
