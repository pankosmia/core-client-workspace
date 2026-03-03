import {
  DialogContent,
  Grid2,
  Typography,
} from "@mui/material";
import LlmModelPicker from "./LlmModelPicker";
import NumberPicker from "./NumberPicker";
import { PanDialog } from "pankosmia-rcl";
import { doI18n } from "pithekos-lib";
import { useContext } from "react";
import { i18nContext } from "pankosmia-rcl";

export default function DialogResources({
  open,
  close,
  resources,
  setResources
}) {
  const { i18nRef } = useContext(i18nContext);

  return (
    <PanDialog
      titleLabel={doI18n(
        "pages:core-local-workspace:resources_rhakos",
        i18nRef.current,
      )}
      isOpen={open}
      closeFn={() => close(false)}
    >
      <DialogContent>
        <Grid2 container spacing={2}>
          <Grid2
            size={12}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            choices go here
          </Grid2>
        </Grid2>
      </DialogContent>
    </PanDialog>
  );
}
