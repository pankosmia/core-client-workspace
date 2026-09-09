import { useState } from "react";
import { Box } from "@mui/material";
import { JuxtaDraftingEditor } from "pankosmia-juxta-muncher";
function JuxtalinearEditorMuncher({
  metadata,
  bcvRef,
  debugRef,
  i18nRef,
  currentProjectRef,
}) {
  const [modified, setModified] = useState(false);

  return (
    <Box sx={{ p: 2 }}>
      <JuxtaDraftingEditor
        metadata={metadata}
        modified={modified}
        setModified={setModified}
        bcvRef={bcvRef}
        debugRef={debugRef}
        i18nRef={i18nRef}
        currentProjectRef={currentProjectRef}
      />
    </Box>
  );
}
export default JuxtalinearEditorMuncher;
