import { useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

function formattedModel(m)  {return m ? `${m[0]}${m[1] ? " (quantized)" : ""}` : '-'};

export default function LlmModelPicker({
  models,
  selectedModel,
  setSelectedModel,
}) {
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <div>
      <Button
        id="llm-model-button"
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
        }}
      >
        {formattedModel(selectedModel)}
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
        slotProps={{
          list: {
            "aria-labelledby": "llm-model-button",
          },
        }}
      >
        {
            models.map(
                e => <MenuItem onClick={() => {setSelectedModel(e); setAnchorEl(null);}}>{formattedModel(e)}</MenuItem>
            )
        }
      </Menu>
    </div>
  );
}
