import { useEffect, useRef } from "react";

export default function ViewableBibleBlock({
  blockJson,
  systemBcv,
  lastPrintedVerseRef,
  systemWord,
  systemSnippet,
}) {
  const versesRefs = useRef({});

  useEffect(() => {
    const verseToScroll = String(systemBcv.verseNum);
    if (verseToScroll && versesRefs.current[verseToScroll]) {
      versesRefs.current[verseToScroll].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [systemBcv.verseNum]);

  // snippet can have multiple words
  const snippetWords = systemSnippet ? systemSnippet.trim().split(/\s+/) : [];

  const wordMatchesSnippet = (word) => {
    if (!word.source || snippetWords.length === 0) return false;
    return word.source.some((s) => snippetWords.includes(s));
  };

  const wordMatchesSystemWord = (word) => {
    const target = systemWord?.target;
    if (!target) return false;
    return word.target.trim().toLowerCase() === target.trim().toLowerCase();
  };

  const renderContent = (content, allowSnippetHighlight) => {
    return content.map((word, i) => {
      const highlightBySnippet =
        allowSnippetHighlight && wordMatchesSnippet(word);
      const highlightByWord = wordMatchesSystemWord(word);

      if (highlightBySnippet || highlightByWord) {
        return (
          <mark
            key={i}
            style={{ backgroundColor: "#FFD700", borderRadius: "2px" }}
          >
            {word.target}
          </mark>
        );
      }
      return word.target;
    });
  };

  return (
    <div
      className={blockJson.tag}
      style={{
        marginBottom: "0.5em",
        textAlign: "justify",
        wordBreak: "break-word",
      }}
    >
      {blockJson?.units?.map((u, i) => {
        const rawContent = u.content || [];
        const contentToDisplay =
          rawContent.length === 1 && rawContent[0].target === "_"
            ? [{ target: " ", source: null }]
            : rawContent;
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
              {isDuplicate && " "}
              {renderContent(contentToDisplay, isSelected)}
            </span>
          </span>
        );
      })}
    </div>
  );
}
