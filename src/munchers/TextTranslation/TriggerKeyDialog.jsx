import React, { useState, useEffect, useRef, useContext } from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { Headphones } from "lucide-react";
import KeyIcon from '@mui/icons-material/Key';
import { AppBar, Box, Button, Dialog, DialogActions, Toolbar, Typography } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import {
  i18nContext as I18nContext,
  doI18n,
} from "pithekos-lib";
export function TriggerKeyDialog({
  isOpen,
  onClose,
  currentTrigger,
  onTriggerChange,
}) {
  const [listening, setListening] = useState(false);
  const [capturedKeys, setCapturedKeys] = useState([]);
  const dialogRef = useRef(null);
  const { i18nRef } = useContext(I18nContext);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCapturedKeys([]);
      setListening(false);
    }
  }, [isOpen]);

  // Handle clicks outside the dialog
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Add keydown handler for ESC to close the dialog
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !listening) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, listening, onClose]);

  // Handle key capture
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!listening) return;

      e.preventDefault();

      // Skip if only modifier keys were pressed
      if (["Control", "Alt", "Shift", "Meta"].includes(e.key)) {
        return;
      }

      const modifiers = [];
      if (e.ctrlKey) modifiers.push("Ctrl");
      if (e.altKey) modifiers.push("Alt");
      if (e.shiftKey) modifiers.push("Shift");
      if (e.metaKey) modifiers.push("Meta");

      setCapturedKeys([...modifiers, e.key]);
      setListening(false);
    };

    if (isOpen && listening) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, listening]);

  const startListening = () => {
    setCapturedKeys([]);
    setListening(true);
  };

  const applyTrigger = () => {
    if (capturedKeys.length > 0) {
      onTriggerChange(capturedKeys.join("+"));
    }
    onClose();
  };

  if (!isOpen) return null;

  return (

    <Dialog
      fullWidth={true}
      open={isOpen}
      //onClose={handleDialogClose}
      sx={{
        backdropFilter: "blur(3px)",
      }}>

      <Box ref={dialogRef} >
        <AppBar color="secondary" sx={{ position: 'relative', borderTopLeftRadius: 4, borderTopRightRadius: 4 }}>
          <Toolbar sx={{ gap: 1 }}>
            <KeyIcon />
            <Typography variant="subtitle2" >{doI18n("pages:core-local-workspace:set_trigger_key", i18nRef.current)}</Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 1, pb: 1 }}>
            <KeyboardIcon />
            <Typography>{doI18n("pages:core-local-workspace:current", i18nRef.current)}</Typography>
            <Typography variant="subtitle1">{currentTrigger}</Typography>
          </Box>
          {/* Capture box */}
            <Box sx={{backgroundColor:"red",display: "flex", flexDirection: "row", alignItems: "center", gap: 1, pb: 1 }}>
              {listening ? (
                <Box>
                  <Headphones/>
                  <Typography>Press keys now...</Typography>
                </Box>
              ) : capturedKeys.length > 0 ? (
                <Box>
                  {capturedKeys.map((key, i) => (
                    <React.Fragment key={i}>
                      <kbd>
                        {key}
                      </kbd>
                      {i < capturedKeys.length - 1 && <Typography className="text-gray-400">+</Typography>}
                    </React.Fragment>
                  ))}
                </Box>
              ) : (
                <Box sx={{backgroundColor:"green",display: "flex", flexDirection: "row", alignItems: "center", gap: 1, pb: 1 }}>
                  <VpnKeyOutlinedIcon />
                  <Typography> {doI18n("pages:core-local-workspace:click_record_below", i18nRef.current)}</Typography>
                </Box>
              )}
            </Box>

          {/* Record Button */}
          <DialogActions sx={{alignItems:"center"}}>
            <Button
              onClick={startListening}
              disabled={listening}
              color="primary"
            >
              {listening ? (
                <>
                  <Headphones className="h-4 w-4" />
                  {doI18n("pages:core-local-workspace:listening", i18nRef.current)}
                </>
              ) : (
                <>
                  <KeyboardIcon />
                  {doI18n("pages:core-local-workspace:record_key_combination", i18nRef.current)}
                </>
              )}
            </Button>
          </DialogActions>


          {/* Info tip */}
          <Typography variant="caption">
            <InfoIcon />
            {doI18n("pages:core-local-workspace:modification_key", i18nRef.current)}
          </Typography>

          {/* Action buttons */}
          <DialogActions>
            <Button
              onClick={onClose}
            >
              {doI18n("pages:core-local-workspace:cancel", i18nRef.current)}
            </Button>
            <Button
              onClick={applyTrigger}
              color="primary"
              variant="contained"
              disabled={capturedKeys.length === 0}
            >
              {doI18n("pages:core-local-workspace:apply", i18nRef.current)}
            </Button>
          </DialogActions>
        </Box>
      </Box>
    </Dialog>
  );
}
