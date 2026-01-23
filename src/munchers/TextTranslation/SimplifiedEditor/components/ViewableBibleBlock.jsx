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
        <div
            className={blockJson.tag} 
            style={{ 
                marginBottom: "0.5em", 
                textAlign: "justify",
                wordBreak: "break-word" 
            }}
        >
            {blockJson?.units?.map((u, i) => {
                const rawContent = u.content || "";
                const contentToDisplay = rawContent === "_" ? " " : rawContent;
                const currentVerse = String(u.verses);
                const isDuplicate = currentVerse === lastPrintedVerseRef.current;
                if (!isDuplicate) lastPrintedVerseRef.current = currentVerse;
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
        </div>
    );
}