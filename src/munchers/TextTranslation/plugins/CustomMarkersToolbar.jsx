import {
  useFilteredMarkers,
} from "@scriptural/react/plugins/ToolbarPlugin/MarkersToolbar";
import { ToolbarSection } from "@scriptural/react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

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
    <div className="w-full border-t border-gray-200 pt-1 mt-1">
      <div className="flex flex-wrap gap-1 px-2">
        {Object.entries(categories).map(([categoryName, items]) => {
          if (items.length === 0) return null;

          return (
            <ToolbarSection
              key={`markers-section-${categoryName}`}
              className="flex flex-wrap gap-1 mr-3"
            >
              {items.map((marker) => (
                <button
                  key={`marker-${marker.name}`}
                  className="px-2 py-1 text-xs font-mono bg-white border border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100"
                  onClick={() => marker.action(editor)}
                  title={marker.description || marker.name}
                  data-marker={marker.name}
                >
                  {marker.name}
                </button>
              ))}
            </ToolbarSection>
          );
        })}
      </div>
    </div>
  );
}

export default CustomMarkersToolbar;
