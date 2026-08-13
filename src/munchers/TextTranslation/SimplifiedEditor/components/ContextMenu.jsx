import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

export default function ContextMenu({ contextMenuValue, handleClose }) {
  return (
    <Menu
      open={contextMenuValue}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenuValue
          ? {
              top: contextMenuValue.mouseY,
              left: contextMenuValue.mouseX,
            }
          : undefined
      }
    >
      <MenuItem onClick={handleClose}>Copy</MenuItem>
      <MenuItem onClick={handleClose}>Print</MenuItem>
      <MenuItem onClick={handleClose}>Highlight</MenuItem>
      <MenuItem onClick={handleClose}>Email</MenuItem>
    </Menu>
  );
}
