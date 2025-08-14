import { useRef, useEffect, useContext } from "react";
import { useFindReplace } from "@scriptural/react";
import { Loader2 } from "lucide-react";
import CloseIcon from '@mui/icons-material/Close';
import { VscReplace } from "react-icons/vsc";
import { VscReplaceAll } from "react-icons/vsc";
import { Button, Typography, Box, TextField, IconButton, Stack, Grid2, Toolbar, Dialog, AppBar, DialogActions } from "@mui/material";
import {
  i18nContext as I18nContext,
  doI18n,
} from "pithekos-lib";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
export function FindReplaceDialog() {
  const {
    searchText,
    setSearchText,
    replaceText,
    setReplaceText,
    results,
    currentResultIndex,
    isVisible,
    handlePrev,
    handleNext,
    handleReplace,
    handleReplaceAll,
    handleClose,
    isSearching,
  } = useFindReplace();

  const searchInputRef = useRef(null);
  const { i18nRef } = useContext(I18nContext);

  // Focus the search input when the component becomes visible
  useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <Dialog
      fullWidth
      open={isVisible}
      onClose={handleClose}
      sx={{
        '& .MuiDialog-container': {
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
          backgroundColor: 'transparent'
        },
      }}
    >
      <AppBar color="secondary" sx={{ position: 'relative', borderTopLeftRadius: 4, borderTopRightRadius: 4 }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="subtitle1"> {doI18n("pages:core-local-workspace:find_replace", i18nRef.current)}</Typography>
          <IconButton
            onClick={handleClose}
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 2 }}>
        <Box>
          <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
            <TextField
              ref={searchInputRef}
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={`${doI18n("pages:core-local-workspace:find", i18nRef.current)}`}

            />
            <Box>
              <IconButton
                onClick={handlePrev}
                disabled={results.length === 0 || isSearching}
                title="Previous"
              >
                <KeyboardArrowUpIcon />
              </IconButton>
              <IconButton
                onClick={handleNext}
                disabled={results.length === 0 || isSearching}
                title="Next"
              >
                <KeyboardArrowDownIcon />
              </IconButton>
            </Box>
          </Box>

          <Typography sx={{ p: 1 }}>
            {isSearching ? (
              <>
                <Loader2 size={14} className="animate-spin mr-1" />
                <Typography>{doI18n("pages:core-local-workspace:searching", i18nRef.current)}</Typography>
              </>
            ) : results.length > 0 ? (
              `${currentResultIndex + 1} of ${results.length}`
            ) : searchText ? (
              `${doI18n("pages:core-local-workspace:no_result", i18nRef.current)}`
            ) : (
              `${doI18n("pages:core-local-workspace:type_to_search", i18nRef.current)}`
            )}
          </Typography>
        </Box>

        <Box>
          <TextField
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder={`${doI18n("pages:core-local-workspace:replace_with", i18nRef.current)}`}
          />
          <DialogActions>
            <Button
              onClick={handleReplace}
              disabled={results.length === 0 || currentResultIndex === -1 || isSearching}
              title="Replace"
            >
              <VscReplace />
              <Typography variant="caption">{doI18n("pages:core-local-workspace:replace_one", i18nRef.current)}</Typography>
            </Button>

            <Button
              onClick={handleReplaceAll}
              disabled={results.length === 0 || isSearching}
              title="Replace All"
            >
              <VscReplaceAll />
              <Typography variant="caption"> {doI18n("pages:core-local-workspace:replace_all", i18nRef.current)}</Typography>
            </Button>
          </DialogActions>
        </Box>
      </Box>
    </Dialog >

  );
}
