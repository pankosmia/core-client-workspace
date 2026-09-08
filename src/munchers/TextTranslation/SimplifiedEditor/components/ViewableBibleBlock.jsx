import { useEffect, useRef, useContext } from "react";
import { postEmptyJson } from "pankosmia-lib/http";
import { debugContext } from "pankosmia-rcl";

export default function ViewableBibleBlock({
  position,
  blockJson,
  systemBcv,
  lastPrintedVerseRef,
  systemWord,
  isCurrentBlock,
  setSelectedBlockNo,
}) {
  const versesRefs = useRef({});
  const { debugRef } = useContext(debugContext);

  useEffect(() => {
    const verseToScroll = String(systemBcv.verseNum);
    if (verseToScroll && versesRefs.current[verseToScroll]) {
      versesRefs.current[verseToScroll].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [systemBcv.verseNum]);

  const highlightText = (text, target) => {
    if (!target) return text;
    const str = String(text);
    const parts = str.split(
      new RegExp(`(?<!\\p{L})(${target})(?!\\p{L})`, "giu"),
    );
    return parts.map((part, i) =>
      part.toLowerCase() === target.toLowerCase() ? (
        <mark
          key={i}
          style={{ backgroundColor: "#FFD700", borderRadius: "2px" }}
        >
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  const updateBcv = (b, c, v, ev) => {
    postEmptyJson(
      `/api/navigation/bcv/${b}/${c}/${v}/${ev ? ev : v}`,
      debugRef.current,
    );
  };

  let chapter = null;
  let verse = null;
  let endVerse = null;
  if (blockJson.units && blockJson.units[0] && blockJson.units[0].verses) {
    let firstUnit = blockJson.units[0];
    chapter = firstUnit.chapter;
    let verses = firstUnit.verses;
    verse = verses.includes("-") ? verses.split("-")[0] : verses;
    endVerse = verses.includes("-") ? verses.split("-")[1] : verses;
  }

  return (
    <div
      className={blockJson.tag}
      style={{
        marginBottom: "0.5em",
        textAlign: "justify",
        wordBreak: "break-word",
        border: `solid ${isCurrentBlock ? "black" : "transparent"} 2px`,
        padding: "2px",
      }}
      onClick={() => {
        if (verse) {
          updateBcv(systemBcv.bookCode, chapter, verse, endVerse);
        }
        setSelectedBlockNo(position[0]);
      }}
    >
      {blockJson?.units?.map((u, i) => {
        const rawContent = u.content || "";
        const contentToDisplay = rawContent === "_" ? " " : rawContent;
        const currentVerse = String(u.verses);
        const isDuplicate = currentVerse === lastPrintedVerseRef.current;
        if (!isDuplicate) lastPrintedVerseRef.current = currentVerse;
        const verseRange = currentVerse.split("-").map(Number);
        const blockStart = verseRange[0];
        const blockEnd = verseRange[verseRange.length - 1];
        const selectStart = Number(systemBcv.verseNum);
        const selectEnd = systemBcv.endVerseNum
          ? Number(systemBcv.endVerseNum)
          : selectStart;
        const isSelected = blockStart <= selectEnd && blockEnd >= selectStart;

        return (
          <span
            key={`${currentVerse}-${i}`}
            ref={(el) => {
              if (!isDuplicate) {
                versesRefs.current[currentVerse] = el;
                if (verseRange.length > 1) {
                  for (
                    let n = verseRange[0];
                    n <= verseRange[verseRange.length - 1];
                    n++
                  ) {
                    versesRefs.current[String(n)] = el;
                  }
                }
              }
            }}
            style={{
              backgroundColor: isSelected ? "#CCC" : "transparent",
              display: "inline",
            }}
          >
            {!isDuplicate && (
              <span
                className="marks_verses_label"
                style={{ marginRight: "4px" }}
              >
                {currentVerse}
              </span>
            )}
            <span style={{ whiteSpace: "normal", paddingRight: "2pt" }}>
              {isDuplicate
                ? ` ${highlightText(contentToDisplay, systemWord?.target)}`
                : highlightText(contentToDisplay, systemWord?.target)}
            </span>
          </span>
        );
      })}
    </div>
  );
}
