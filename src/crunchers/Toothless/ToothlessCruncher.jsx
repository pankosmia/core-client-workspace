import { useContext } from "react";
import { Box, Grid2 } from "@mui/material";
import { doI18n } from "pithekos-lib";
import {
  i18nContext as I18nContext,
} from "pankosmia-rcl";

function ToothlessCruncher({ metadata, style }) {
  const { i18nRef } = useContext(I18nContext);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid2
        container
        direction="row"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        spacing={2}
      >
        <Grid2 item size={12}>
          <Box sx={{ p: 2 }}>
            <h5>{metadata.name}</h5>
            <p>
              <b>{doI18n("crunchers:toothless:title", i18nRef.current)}</b>
            </p>
            {metadata.description.length > 0 && (
              <p>Description: {metadata.description}</p>
            )}
          </Box>
        </Grid2>
        <Box sx={{ p: 2 }}>
          Cruuuunch!
          </Box>
      </Grid2>
    </Box>
  );
}

export default ToothlessCruncher;
