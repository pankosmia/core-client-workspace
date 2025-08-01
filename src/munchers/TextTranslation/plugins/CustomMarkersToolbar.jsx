import {
  useFilteredMarkers,
} from "@scriptural/react/plugins/ToolbarPlugin/MarkersToolbar";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Box, Button } from "@mui/material";

/**
 * Implementation of markers toolbar directly in component
 */
export function CustomMarkersToolbar({ customMarkers, doI18n, i18nRef }) {
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
                  title={doI18n("pages:core-local-workspace:usfm_button", i18nRef.current)}
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
