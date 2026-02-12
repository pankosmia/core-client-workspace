import React from "react";
import ToothlessCruncher from "../../crunchers/Toothless/ToothlessCruncher";
import RhakosCruncher from "../../crunchers/Rhakos/RhakosCruncher";

import "./tiles_styles.css";

// metadata for a cruncher:
// - type, eg "rhakos
// - description

function WorkspaceCruncherCard({metadata, style, distractionModeCount}) {

  const sbScriptDir = metadata?.script_direction ? metadata.script_direction.toLowerCase() : undefined
  const sbScriptDirSet = sbScriptDir === 'ltr' || sbScriptDir === 'rtl';

    if ((distractionModeCount % 2) > 0) {
        return <div style={{...style, backgroundImage:'url("/app-resources/pages/workspace/tile_blur.png")', filter: "blur(1px)"}} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        </div>
    }
    // Override tailwind with lineHeight: 'normal' to support Awami Nastaliq
    if (metadata.type === "rhakos") {
        return <div style={{...style, lineHeight: 'normal'}} dir={sbScriptDirSet ? sbScriptDir : undefined}>
          <RhakosCruncher
            metadata={metadata}
            style={style}
          />
        </div>
    }
  // DO NOT REMOVE! Fallback so that an element is always returned
  return (
    <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
      <ToothlessCruncher
          metadata={metadata}
          style={style}
      />
    </div>
  );
}

export default WorkspaceCruncherCard;
