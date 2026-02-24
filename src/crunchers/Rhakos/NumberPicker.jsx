import { useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";


export default function NumberPicker({
  state,
  setState,
  options
}) {
  const [anchorEl, setAnchorEl] = useState(null);

    return (
      <div>
        <Button
          id="number-picker-button"
          onClick={(event) => {
            setAnchorEl(event.currentTarget);
          }}
        >
          {state}
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
              options.map(
                  o => <MenuItem onClick={() => {setState(o); setAnchorEl(null);}}>{o}</MenuItem>
              )
          }
        </Menu>
      </div>
    );
}