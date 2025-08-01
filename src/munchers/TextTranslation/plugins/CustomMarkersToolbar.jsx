import {
  useFilteredMarkers,
} from "@scriptural/react/plugins/ToolbarPlugin/MarkersToolbar";
import { ToolbarSection } from "@scriptural/react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Box, Button, ButtonGroup } from "@mui/material";

/**
 * Implementation of markers toolbar directly in component
 */
export function CustomMarkersToolbar({ customMarkers }) {
  const [editor] = useLexicalComposerContext();
  const { categories, isLoading } = useFilteredMarkers({ customMarkers });

  if (isLoading || Object.keys(categories).length === 0) {
    return null;
  }

  return (
    <Box sx={{display:"flex", alignItems:"center"}}>
        {Object.entries(categories).map(([categoryName, items]) => {
          if (items.length === 0) return null;
          return (
            <Box
              key={`markers-section-${categoryName}`}>
              {items.map((marker) => (
                <Button
                  key={`marker-${marker.name}`}
                  onClick={() => marker.action(editor)}
                  title={marker.description || marker.name}
                  data-marker={marker.name}
                  sx={{border:0}}
                  size="small"
                >
                  {marker.name}
                </Button>
              ))}
            </Box>
          );
        })}
    </Box>
  );
}

export default CustomMarkersToolbar;
