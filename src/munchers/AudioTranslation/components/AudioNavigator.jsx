import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import {
  Box,
  IconButton,
  ButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListSubheader,
} from "@mui/material";
import { useContext } from "react";
import { i18nContext as I18nContext } from "pankosmia-rcl";
import { doI18n } from "pithekos-lib";

// Single navigation control for the audio translation editor, modelled on
// OBSNavigator: double arrows jump book, single arrows move one segment.
// Two dropdowns inside allow manual book / segment selection. Prop-driven.
function AudioNavigator({
  book,
  books,
  onSelectBook,
  segIndex,
  flatSegments,
  onSelectSegment,
  onPrevBook,
  onPrevSegment,
  onNextSegment,
  onNextBook,
  prevBookDisabled,
  prevSegmentDisabled,
  nextSegmentDisabled,
  nextBookDisabled,
}) {
  const { i18nRef } = useContext(I18nContext);

  // Segment menu items, grouped by start chapter for orientation. The MenuItem
  // value is the index into flatSegments so selection maps straight to segIndex.
  const segmentItems = [];
  let lastChapter = null;
  flatSegments.forEach((s, idx) => {
    if (s.chapter !== lastChapter) {
      lastChapter = s.chapter;
    }
    segmentItems.push(
      <MenuItem key={s.audioId} value={idx} dense>
        {s.ref}
      </MenuItem>,
    );
  });

  return (
    <Box
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <ButtonGroup>
        <IconButton disabled={prevBookDisabled} onClick={onPrevBook}>
          <KeyboardDoubleArrowLeftIcon fontSize="medium" />
        </IconButton>
        <IconButton disabled={prevSegmentDisabled} onClick={onPrevSegment}>
          <KeyboardArrowLeftIcon fontSize="medium" />
        </IconButton>
      </ButtonGroup>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mx: 2 }}>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel id="audio-nav-book-label">
            {doI18n("pages:core-local-workspace:book", i18nRef.current)}
          </InputLabel>
          <Select
            labelId="audio-nav-book-label"
            label={doI18n("pages:core-local-workspace:book", i18nRef.current)}
            value={book}
            onChange={(e) => onSelectBook(e.target.value)}
          >
            {books.map((b) => (
              <MenuItem key={b} value={b} dense>
                {b}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          size="small"
          sx={{ minWidth: 140 }}
          disabled={!flatSegments.length}
        >
          <InputLabel id="audio-nav-segment-label">
            {doI18n("pages:core-local-workspace:segment", i18nRef.current)}
          </InputLabel>
          <Select
            labelId="audio-nav-segment-label"
            label={doI18n(
              "pages:core-local-workspace:segment",
              i18nRef.current,
            )}
            value={flatSegments.length ? segIndex : ""}
            onChange={(e) => onSelectSegment(e.target.value)}
            renderValue={(idx) => flatSegments[idx]?.ref ?? ""}
          >
            {segmentItems}
          </Select>
        </FormControl>
      </Box>

      <ButtonGroup>
        <IconButton disabled={nextSegmentDisabled} onClick={onNextSegment}>
          <KeyboardArrowRightIcon fontSize="medium" />
        </IconButton>
        <IconButton disabled={nextBookDisabled} onClick={onNextBook}>
          <KeyboardDoubleArrowRightIcon fontSize="medium" />
        </IconButton>
      </ButtonGroup>
    </Box>
  );
}

export default AudioNavigator;
