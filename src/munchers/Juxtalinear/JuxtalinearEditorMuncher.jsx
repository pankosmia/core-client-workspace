import { useState } from "react";
import { Box } from "@mui/material";
import JuxtaDraftingEditor from "./components/JuxtaDraftingEditor/JuxtaDraftingEditor";

function JuxtalinearEditorMuncher({ metadata }) {
  const [modified, setModified] = useState(false);

  return (
    <Box sx={{ p: 2 }}>
      <JuxtaDraftingEditor
        metadata={metadata}
        modified={modified}
        setModified={setModified}
      />
    </Box>
  );
}
export default JuxtalinearEditorMuncher;
