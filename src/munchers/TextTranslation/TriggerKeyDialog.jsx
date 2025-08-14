import React, { useState, useEffect, useRef, useContext } from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { Headphones} from "lucide-react";
import KeyIcon from '@mui/icons-material/Key';
import { Box, Button, Typography } from "@mui/material";
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
    <Box className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-200">
      <Box
        ref={dialogRef}
        className="bg-white rounded-lg shadow-lg border border-gray-200 w-[400px] max-w-[calc(100vw-2rem)] animate-in fade-in zoom-in-95 duration-200"
      >
        <Box className="p-5 pt-0">
          {/* Header */}
          <Box className="flex items-center justify-between mb-4">
            <Box className="flex items-center gap-2">
             <KeyIcon/>
              <Typography className="font-semibold text-lg text-gray-900">{doI18n("pages:core-local-workspace:set_trigger_key", i18nRef.current)}</Typography>
            </Box>
          </Box>

          {/* Current trigger */}
          <Box className="flex items-center mb-4 gap-2">
            <KeyboardIcon/>
            <Box className="flex items-center gap-2">
              <Typography>{doI18n("pages:core-local-workspace:current", i18nRef.current)}</Typography>
              <Typography>
                {currentTrigger}
              </Typography>
            </Box>
          </Box>

          {/* Capture box */}
          <Box
            className={`
              relative border rounded-md overflow-hidden transition-all duration-200 mb-3
              ${listening
                ? "border-blue-400 shadow-[0_0_0_1px_rgba(59,130,246,0.3)]"
                : "border-gray-300"
              }
            `}
          >
            <Box
              className={`
                p-4 text-center font-mono text-base transition-colors
                ${listening ? "bg-blue-50 text-blue-700" : "bg-white"}
              `}
            >
              {listening ? (
                <Box className="flex items-center justify-center gap-2">
                  <Headphones className="h-5 w-5 animate-pulse" />
                  <span className="animate-pulse">Press keys now...</span>
                </Box>
              ) : capturedKeys.length > 0 ? (
                <Box className="flex items-center justify-center gap-1 flex-wrap">
                  {capturedKeys.map((key, i) => (
                    <React.Fragment key={i}>
                      <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 text-gray-800 text-xs font-semibold">
                        {key}
                      </kbd>
                      {i < capturedKeys.length - 1 && <span className="text-gray-400">+</span>}
                    </React.Fragment>
                  ))}
                </Box>
              ) : (
                <Box className="flex items-center justify-center gap-2 text-gray-500">
                  <VpnKeyOutlinedIcon/>
                  <span>Click 'Record' below</span>
                </Box>
              )}
            </Box>
          </Box>

          {/* Record Button */}
          <Button
            onClick={startListening}
            disabled={listening}
            className={`
              w-full py-2 px-4 rounded-md text-sm font-medium transition-colors
              flex items-center justify-center gap-2
              ${listening
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              }
            `}
          >
            {listening ? (
              <>
                <Headphones className="h-4 w-4" />
                Listening...
              </>
            ) : (
              <>
                <KeyboardIcon/> 
                Record Key Combination
              </>
            )}
          </Button>

          {/* Info tip */}
          <Typography variant="caption">
            <InfoIcon/>
              {doI18n("pages:core-local-workspace:modification_key", i18nRef.current)}
          </Typography>

          {/* Action buttons */}
          <Box className="mt-5 flex justify-end gap-3">
            <Button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1"
            >
             {doI18n("pages:core-local-workspace:cancel", i18nRef.current)}
            </Button>
            <Button
              onClick={applyTrigger}
              color="primary"
              variant="contained"
              disabled={capturedKeys.length === 0}
              className={`
                px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors
                flex items-center gap-1
                ${capturedKeys.length === 0
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
                }
              `}
            >
              {doI18n("pages:core-local-workspace:apply", i18nRef.current)}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
