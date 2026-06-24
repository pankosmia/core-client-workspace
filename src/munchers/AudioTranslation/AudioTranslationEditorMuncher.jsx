import { useState, useEffect, useContext, useMemo } from "react";
import { Box, Typography } from "@mui/material";

import {
  i18nContext as I18nContext,
  debugContext as DebugContext,
} from "pankosmia-rcl";
import { postEmptyJson } from "pankosmia-lib/http";
import { doI18n } from "pankosmia-lib/i18n";

import AudioRecorder from "../OBS/components/AudioRecorder";
import AudioEditorTools from "./components/AudioEditorTools";
import {
  loadGeneratedAtMap,
  saveGeneratedAt,
} from "../OBS/components/lib/audioGeneratedAt";

// Derive the segments of one book straight from the plan, at the chosen
// granularity. Books carry no info of their own in audio translation, so there
// is no per-book file: the plan (stored in the repo) is the single source of
// truth. Each segment gets an audioId "CC-PP" (start chapter / index within
// that chapter); combined with the book it gives audio_content/<BOOK>/CC-PP/.
function deriveChapters(plan, bookCode, segmentation) {
  if (!plan || !bookCode) return [];
  const bookSections = plan.sections.filter((s) => s.bookCode === bookCode);
  const chapterRefs = new Map();
  const addRef = (chapter, ref) => {
    if (!chapterRefs.has(chapter)) chapterRefs.set(chapter, []);
    chapterRefs.get(chapter).push(ref);
  };
  for (const section of bookSections) {
    if (segmentation === "section") {
      addRef(
        parseInt(section.cv[0].split(":")[0]),
        `${section.cv[0]}-${section.cv[1]}`,
      );
    } else {
      // paragraph: ONE segment per paragraph, spanning its first..last unit.
      // units may be single verses (["1:1","1:2"]) or already a range
      // (["1:1-11"]) depending on the plan, so derive the span from the ends.
      for (const para of section.paragraphs) {
        if (para.units && para.units.length) {
          const first = para.units[0];
          const last = para.units[para.units.length - 1];
          addRef(
            parseInt(first.split(":")[0]),
            first === last ? first : `${first}-${last}`,
          );
        } else if (para.cv) {
          addRef(
            parseInt(String(para.cv[0]).split(":")[0]),
            `${para.cv[0]}-${para.cv[1]}`,
          );
        }
      }
    }
  }
  return Array.from(chapterRefs.keys())
    .sort((a, b) => a - b)
    .map((chapter) => {
      const cc = String(chapter).padStart(2, "0");
      const segments = chapterRefs.get(chapter).map((ref, idx) => ({
        paragraph: idx,
        ref,
        audioId: `${cc}-${String(idx).padStart(2, "0")}`,
      }));
      return { chapter, segments };
    });
}

function AudioTranslationEditorMuncher({ metadata }) {
  const { i18nRef } = useContext(I18nContext);
  const { debugRef } = useContext(DebugContext);

  const [plan, setPlan] = useState(null);
  const [selectedBook, setSelectedBook] = useState("");
  const [segIndex, setSegIndex] = useState(0);
  const [generatedAtMap, setGeneratedAtMap] = useState(() =>
    loadGeneratedAtMap(metadata?.local_path),
  );

  // 1. Load the plan stored in the repo (single source of structure).
  useEffect(() => {
    if (!metadata?.local_path) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(
          `/api/burrito/ingredient/raw/${metadata.local_path}?ipath=plan.json`,
        );
        if (!r.ok) return;
        const doc = await r.json();
        if (!cancelled) setPlan(doc);
      } catch {
        /* server unreachable / no plan: leave it empty */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [metadata?.local_path]);

  // Books in plan order (a book may span chapters; the segment is the nav axis).
  const books = useMemo(
    () =>
      plan ? Array.from(new Set(plan.sections.map((s) => s.bookCode))) : [],
    [plan],
  );

  useEffect(() => {
    if (books.length && !books.includes(selectedBook)) {
      setSelectedBook(books[0]);
    }
  }, [books, selectedBook]);

  const segmentation = plan?.audioSegmentation || "section";
  const chapters = useMemo(
    () => deriveChapters(plan, selectedBook, segmentation),
    [plan, selectedBook, segmentation],
  );
  const flatSegments = useMemo(() => {
    const out = [];
    for (const c of chapters) {
      for (const s of c.segments) out.push({ ...s, chapter: c.chapter });
    }
    return out;
  }, [chapters]);

  // Clamp segIndex when the book (and thus the segment list) changes.
  useEffect(() => {
    setSegIndex(0);
  }, [selectedBook]);

  const current = flatSegments[segIndex] || null;
  // Book-unique key: audioId (CC-PP) repeats across books, so include the book
  // to force a clean remount when navigating book -> book at the same CC-PP.
  const segmentKey = current ? `${selectedBook}-${current.audioId}` : null;
  // obs = [chapter, paragraph]; with book -> audio_content/<BOOK>/CC-PP/.
  const obs = useMemo(
    () => (current ? [current.chapter, current.paragraph] : null),
    [segmentKey, current],
  );

  // Push the current segment to the global reference so the other workspace
  // munchers (notes, images, ...) follow. ref is "C:V", "C:V-V" or "C:V-C:V".
  useEffect(() => {
    if (!current || !selectedBook) return;
    const [chap, verse] = current.ref.split("-")[0].split(":");
    if (!chap || !verse) return;
    const endPart = current.ref.split("-")[1];
    const endVerseWithoutChapter = endPart?.split(":")?.[1];
    const endVerse = endVerseWithoutChapter ? endVerseWithoutChapter : endPart;
    postEmptyJson(
      `/api/navigation/bcv/${selectedBook}/${chap}/${verse}${endVerse ? `/${endVerse}` : ""}`,
      debugRef.current,
    );
  }, [selectedBook, segmentKey, current, debugRef]);

  const bookIndex = books.indexOf(selectedBook);
  const goToBook = (idx) => {
    if (idx >= 0 && idx < books.length) setSelectedBook(books[idx]);
  };

  const postAudioCompile = async (endpoint, payload, errorMessage) => {
    const response = await fetch(
      `/api/audio/${endpoint}/${metadata.local_path}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    if (!response.ok) {
      throw new Error(`${errorMessage}: ${response.status}, ${response.error}`);
    }
  };

  const compileAudio = async () => {
    if (!current || !selectedBook) {
      throw new Error("No audio segment selected");
    }

    await postAudioCompile(
      "compile",
      {
        book: selectedBook,
        chapter: current.chapter,
        paragraph: current.paragraph,
      },
      "Failed to compile audio",
    );
    await postAudioCompile(
      "compile-chapter",
      {
        book: selectedBook,
        chapter: current.chapter,
      },
      "Failed to compile audio chapter",
    );

    setGeneratedAtMap(saveGeneratedAt(metadata?.local_path, segmentKey));
  };

  return (
    <Box>
      <AudioEditorTools
        compileAudio={current ? compileAudio : null}
        generatedAt={segmentKey ? generatedAtMap[segmentKey] : null}
        nav={{
          book: selectedBook,
          books,
          segmentation,
          onSelectBook: setSelectedBook,
          segIndex,
          flatSegments,
          onSelectSegment: setSegIndex,
          onPrevBook: () => goToBook(bookIndex - 1),
          onPrevSegment: () => setSegIndex(segIndex - 1),
          onNextSegment: () => setSegIndex(segIndex + 1),
          onNextBook: () => goToBook(bookIndex + 1),
          prevBookDisabled: bookIndex <= 0,
          prevSegmentDisabled: segIndex <= 0,
          nextSegmentDisabled: segIndex >= flatSegments.length - 1,
          nextBookDisabled: bookIndex < 0 || bookIndex >= books.length - 1,
        }}
      />

      <Box sx={{ padding: 2 }}>
        {current ? (
          <AudioRecorder
            key={segmentKey}
            audioUrl=""
            metadata={metadata}
            obs={obs}
            book={selectedBook}
            // Nom de la piste principale d'un nouveau segment : code livre +
            // référence chapitre:verset, ex. "MRK 1:3".
            mainTrackName={`${selectedBook} ${current.ref}`}
          />
        ) : (
          <Typography sx={{ color: "text.secondary", padding: 2 }}>
            {doI18n(
              "pages:core-local-workspace:select_segment",
              i18nRef.current,
            )}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default AudioTranslationEditorMuncher;
