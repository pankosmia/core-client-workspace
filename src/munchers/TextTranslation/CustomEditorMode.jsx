import { useState, useContext, useRef } from "react";
import "./TextTranslationEditorMuncher.css";
import { i18nContext as I18nContext, doI18n } from "pithekos-lib";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

function ChangeEditorDialog({
  modeChangeDialogOpen,
  setModeChangeDialogOpen,
  newEditor,
  setEditor,
  setModified,
}) {
  const { i18nRef } = useContext(I18nContext);
  return (
    <Dialog
      open={modeChangeDialogOpen}
      onClose={() => setModeChangeDialogOpen(false)}
      slotProps={{
        paper: {
          component: "form",
        },
      }}
    >
      <DialogTitle>
        <b>
          {doI18n(
            "pages:core-local-workspace:change_editor_title",
            i18nRef.current
          )}
        </b>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography>
            {doI18n(
              "pages:core-local-workspace:change_editor_without_saving",
              i18nRef.current
            )}
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setModeChangeDialogOpen(false);
          }}
        >
          {doI18n("pages:core-local-workspace:cancel", i18nRef.current)}
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={async () => {
            setEditor(newEditor);
            setModified(false);
            setModeChangeDialogOpen(false);
          }}
        >
          {doI18n(
            "pages:core-local-workspace:do_change_editor",
            i18nRef.current
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function CustomEditorMode({editor,modified,setEditor,setModified }) {
  const { i18nRef } = useContext(I18nContext);
 
  const [modeChangeDialogOpen, setModeChangeDialogOpen] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const newEditorRef = useRef("");

    const pageOptions = [
        {value: 'units', label: 'Units of meaning'},
        {value: 'chapter', label: 'Chapter'},
    ];

    const handleChange = (event) => {
        if (!warningOpen){
            newEditorRef.current = event.target.value;
        }
        if (editor === 'chapter' && !warningOpen) {
            handleWarningOpen();
        } else {
            if (modified) {
                setModeChangeDialogOpen(true);
            } else {
                setEditor(newEditorRef.current);
                setModified(false);
            }
        }
    };
    const handleWarningOpen = () => {
        setWarningOpen(true);
    };

    const handleWarningClose = () => {
        setWarningOpen(false);
    };

  return (
    <Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <FormControl size="small">
              <InputLabel id="page-selector-label">
                  {doI18n("pages:core-local-workspace:editor_mode", i18nRef.current)}
              </InputLabel>
              <Select
                  labelId="page-selector-label"
                  value={editor}
                  onChange={handleChange}
                  label={doI18n(
                  "pages:core-local-workspace:editor_mode",
                  i18nRef.current
                  )}
                  renderValue={(selected) => (
                  <Box sx={{ display: "flex", alignItems: "center", padding:"0px" }}>
                      <Chip
                      label={
                          pageOptions.find((opt) => opt.value === selected)?.label
                      }
                      size="small"
                      />
                  </Box>
                  )}
                  sx={{ borderRadius: "28px" }}
              >
                  {pageOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                      {option.label}
                  </MenuItem>
                  ))}
              </Select>
            </FormControl>
        </Box>
        
        <ChangeEditorDialog
            modeChangeDialogOpen={modeChangeDialogOpen}
            setModeChangeDialogOpen={setModeChangeDialogOpen}
            newEditor={editor === "chapter" ? "units" : "chapter"}
            setEditor={setEditor}
            setModified={setModified}
        />
        <Dialog
            open={warningOpen}
            onClose={handleWarningClose}
            slotProps={{paper: {component: 'form'}}}
        >
            <DialogTitle><b>{doI18n("pages:core-local-workspace:change_editor_title", i18nRef.current)}</b></DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <Typography>
                        {doI18n("pages:core-local-workspace:editor_warning", i18nRef.current)}
                    </Typography>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button  
                    variant='contained'
                    color="primary"
                    onClick={handleWarningClose}
                >
                    {doI18n("pages:core-local-workspace:close", i18nRef.current)}
                </Button>
                <Button 
                    variant='outlined'
                    color="secondary"
                    onClick={async () => {
                        handleChange();
                        handleWarningClose();
                    }}
                >
                    {doI18n("pages:core-local-workspace:do_change_editor", i18nRef.current)}
                </Button>
            </DialogActions>
        </Dialog>
    </Box>
  );
}

export default CustomEditorMode;
