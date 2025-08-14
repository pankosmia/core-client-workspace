import { useRef, useEffect, useContext } from "react";
import { useFindReplace } from "@scriptural/react";
import { Loader2 } from "lucide-react";
import CloseIcon from '@mui/icons-material/Close';
import { VscReplace } from "react-icons/vsc";
import { VscReplaceAll } from "react-icons/vsc";
import { Button, Typography, Box, TextField, IconButton, Stack, Grid2, Toolbar } from "@mui/material";
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
    <Box className="fixed top-4 right-4 w-80 bg-white rounded-md shadow-lg overflow-hidden border border-gray-200 z-50">
      <Toolbar sx={{justifyContent:"space-between"}}>
        <Typography variant="subtitle1"> {doI18n("pages:core-local-workspace:find_replace", i18nRef.current)}</Typography>
        <IconButton
          onClick={handleClose}
        >
          <CloseIcon />
        </IconButton>
      </Toolbar>

      <Box sx={{ p: 2 }}>
        <Box>
          <Grid2 container spacing={2} justifyItems="flex-end" alignItems="stretch">
            <Grid2 item size={8}>
              <TextField
                ref={searchInputRef}
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={`${doI18n("pages:core-local-workspace:find", i18nRef.current)}`}

              />
            </Grid2>
            <Grid2 item size={4}>
              <Box className="flex items-center space-x-1">
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
            </Grid2>
          </Grid2>
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
          <Box>
            <Grid2 container spacing={2} justifyItems="flex-end" alignItems="stretch">
              <Grid2 item size={6}>
                <Button
                  onClick={handleReplace}
                  disabled={results.length === 0 || currentResultIndex === -1 || isSearching}
                  title="Replace"
                >
                  <VscReplace/>
                  <Typography variant="caption">{doI18n("pages:core-local-workspace:replace_one", i18nRef.current)}</Typography>
                </Button>
              </Grid2>

              <Grid2 item size={6}>
                <Button
                  onClick={handleReplaceAll}
                  disabled={results.length === 0 || isSearching}
                  title="Replace All"
                >
                  <VscReplaceAll/>
                  <Typography variant="caption"> {doI18n("pages:core-local-workspace:replace_all", i18nRef.current)}</Typography>
                </Button>
              </Grid2>
            </Grid2>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
