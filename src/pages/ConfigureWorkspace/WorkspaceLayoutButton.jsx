import { Grid2, ToggleButton, ToggleButtonGroup } from "@mui/material";
import SvgViewEditorBottom from "../../munchers/TextTranslation/SimplifiedEditor/layouts/view_editor_bottom";
import SvgViewEditorLeftColumn from "../../munchers/TextTranslation/SimplifiedEditor/layouts/view_editor_left_column";
import SvgViewEditorRightColumn from "../../munchers/TextTranslation/SimplifiedEditor/layouts/view_editor_right_column";
import SvgViewEditorLeftRow from "../../munchers/TextTranslation/SimplifiedEditor/layouts/view_editor_left_row";
import SvgViewEditorRightRow from "../../munchers/TextTranslation/SimplifiedEditor/layouts/view_editor_right_row";
import SvgViewEditorTop from "../../munchers/TextTranslation/SimplifiedEditor/layouts/view_editor_top";
import SmartToy from "@mui/icons-material/SmartToy";
import { useEffect, useState, useContext } from "react";
import { getJson } from "pithekos-lib";
import { debugContext } from "pankosmia-rcl";

export default function LayoutPicker({
  selectedResources,
  selectedCrunchers,
  setSelectedCrunchers,
  layout,
  setLayout,
}) {
  const [alignment, setAlignment] = useState(
    selectedResources.size === 0 ? "" : layout,
  );
  const [showRhakos, setShowRhakos] = useState(null);
  const { debugRef } = useContext(debugContext);

  const handleAlignment = (newAlignment) => {
    setAlignment(newAlignment);
  };
  useEffect(() => {
    if (selectedResources.size === 0) {
      setAlignment("");
    } else setAlignment(layout);
  }, [selectedResources, layout]);

  useEffect(() => {
    const getModels = async () => {
      const result = await getJson("/llm/model", debugRef.current);
      if (result.ok) {
        setShowRhakos(result.json.length > 0);
      } else {
        setShowRhakos(false);
      }
    };
    if (showRhakos === null) {
      getModels().then();
    }
  }, []);

  const layouts = [
    {
      value: "ViewEditorTop",
      layout: "ViewEditorTop",
      icon: SvgViewEditorTop,
    },
    {
      value: "ViewEditorBottom",
      layout: "ViewEditorBottom",
      icon: SvgViewEditorBottom,
    },
    {
      value: "ViewEditorLeftColumn",
      layout: "ViewEditorLeftColumn",
      icon: SvgViewEditorLeftColumn,
    },
    {
      value: "ViewEditorRightColumn",
      layout: "ViewEditorRightColumn",
      icon: SvgViewEditorRightColumn,
    },
    {
      value: "ViewEditorLeftRow",
      layout: "ViewEditorLeftRow",
      icon: SvgViewEditorLeftRow,
    },
    {
      value: "ViewEditorRightRow",
      layout: "ViewEditorRightRow",
      icon: SvgViewEditorRightRow,
    },
  ];

  return (
    <>
      <Grid2 display="flex" gap={1}>
        <ToggleButtonGroup
          value={alignment}
          exclusive
          onChange={handleAlignment}
        >
          {layouts.map((item) => {
            return (
              <ToggleButton
                key={item.value}
                value={item.value}
                onClick={() => setLayout(item.layout)}
                disabled={selectedResources.size + selectedCrunchers.size === 0}
              >
                <item.icon />
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>
      </Grid2>
      {showRhakos && (
        <Grid2 display="flex" gap={1}>
          <ToggleButtonGroup>
            <ToggleButton
              value="check"
              selected={selectedCrunchers.has("Rhakos")}
              onChange={() => {
                let newSelected = new Set(selectedCrunchers);
                if (selectedCrunchers.has("Rhakos")) {
                  newSelected.delete("Rhakos");
                } else {
                  newSelected.add("Rhakos");
                }
                setSelectedCrunchers(newSelected);
              }}
            >
              <SmartToy />
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid2>
      )}
    </>
  );
}
