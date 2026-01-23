import {useEffect, useRef} from "react";

export default function ViewableBibleBlock({ blockJson, systemBcv, lastPrintedVerseRef }) {
    const versesRefs = useRef({});

    useEffect(() => {
        const verseToScroll = systemBcv.verseNum;
        if (verseToScroll && versesRefs.current[verseToScroll]) {
            versesRefs.current[verseToScroll].scrollIntoView({
                behavior: "auto",
                block: "center",
            });
        }
    }, [systemBcv.verseNum]);

    return (
        <span
            className={blockJson.tag} 
            style={{ display: "contents" }}
        >
            {blockJson?.units?.map((u, i) => {
                const rawContent = u.content || "";
                const contentToDisplay = rawContent === "_" ? " " : rawContent;
                const currentVerse = String(u.verses);
                const isDuplicate = currentVerse === lastPrintedVerseRef.current;
                lastPrintedVerseRef.current = currentVerse;
                const verseRange = currentVerse.split('-').map(Number);
                const systemVerseNum = Number(systemBcv.verseNum);
                const isSelected = verseRange.length === 1 
                    ? systemVerseNum === verseRange[0] 
                    : (systemVerseNum >= verseRange[0] && systemVerseNum <= verseRange[1]);

                return (
                    <span 
                        key={`${currentVerse}-${i}`}
                        ref={(el) => {
                            if (!isDuplicate) {
                                versesRefs.current[currentVerse] = el;
                                if (verseRange.length > 1) versesRefs.current[verseRange] = el;
                            }
                        }}
                        style={{
                            backgroundColor: isSelected ? "#CCC" : "transparent",
                            display: "inline",
                            padding: "0", 
                            boxDecorationBreak: "clone",
                            WebkitBoxDecorationBreak: "clone",
                        }}
                    >
                        {!isDuplicate && (
                            <span className="marks_verses_label" style={{ marginRight: "4px" }}>
                                {currentVerse}
                            </span>
                        )}
                        <span style={{ whiteSpace: "normal", paddingRight: "2pt" }}>
                            {isDuplicate ? ` ${contentToDisplay}` : contentToDisplay}
                        </span>
                    </span>
                );
            })}
        </span>
    );
}