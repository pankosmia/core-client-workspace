import { useRef, useEffect, useContext } from "react";
import { useFindReplace } from "@scriptural/react";
import { Loader2 } from "lucide-react";
import CloseIcon from '@mui/icons-material/Close';
import { VscReplace } from "react-icons/vsc";
import { VscReplaceAll } from "react-icons/vsc";
import { Button, Typography, Box, TextField, IconButton, Toolbar,AppBar, DialogActions, Paper } from "@mui/material";
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
    <Paper
      sx={{
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 1300,
        width: '100%',
        maxWidth: 500,
        borderRadius: 2,
      }}
    >
      <AppBar
        color="secondary"
        sx={{
          position: 'relative',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="subtitle1">
            {doI18n('pages:core-local-workspace:find_replace', i18nRef.current)}
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1}}>
          <TextField
            fullWidth
            inputRef={searchInputRef}
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={doI18n('pages:core-local-workspace:find', i18nRef.current)}
          />
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

        <Typography sx={{ p: 1 }}>
          {isSearching ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Loader2 size={14} />
              <Typography>
                {doI18n('pages:core-local-workspace:searching', i18nRef.current)}
              </Typography>
            </Box>
          ) : results.length > 0 ? (
            `${currentResultIndex + 1} of ${results.length}`
          ) : searchText ? (
            `${doI18n('pages:core-local-workspace:no_result', i18nRef.current)}`
          ) : (
            `${doI18n('pages:core-local-workspace:type_to_search', i18nRef.current)}`
          )}
        </Typography>

        <TextField
          fullWidth
          value={replaceText}
          onChange={(e) => setReplaceText(e.target.value)}
          placeholder={doI18n('pages:core-local-workspace:replace_with', i18nRef.current)}
          sx={{ mb: 2 }}
        />

        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button
            onClick={handleReplace}
            disabled={results.length === 0 || currentResultIndex === -1 || isSearching}
            title="Replace"
            startIcon={<VscReplace />}
          >
            <Typography variant="caption">
              {doI18n('pages:core-local-workspace:replace_one', i18nRef.current)}
            </Typography>
          </Button>

          <Button
            onClick={handleReplaceAll}
            disabled={results.length === 0 || isSearching}
            title="Replace All"
            startIcon={<VscReplaceAll />}
          >
            <Typography variant="caption">
              {doI18n('pages:core-local-workspace:replace_all', i18nRef.current)}
            </Typography>
          </Button>
        </DialogActions>
      </Box>
    </Paper>

  );
}
