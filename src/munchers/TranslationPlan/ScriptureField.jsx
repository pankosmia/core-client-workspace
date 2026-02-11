import React, { useEffect, useRef} from 'react';
import { Box, Typography } from '@mui/material';


function ScriptureField({ section, verseText, selectedBurritoTextDir, systemBcv }) {
    const activeVerseRef = useRef(null);

    useEffect(() => {
        if (activeVerseRef.current) {
            activeVerseRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [systemBcv?.chapterNum, systemBcv?.verseNum]);

    const getVerseData = (chapter, verse) => {
        const chapterData = verseText?.[chapter.toString()] || {};
        
        const parseR = (vStr) => {
            const s = String(vStr || "").replace(/\s+/g, '');
            if (s.includes('-')) {
                const parts = s.split('-').map(Number);
                return { start: parts[0], end: parts[1] };
            }
            const n = Number(s);
            return { start: n, end: n };
        };

        const unit = parseR(verse);

        const matchingKeys = Object.keys(chapterData).filter(key => {
            const k = parseR(key);
            return Math.max(k.start, unit.start) <= Math.min(k.end, unit.end);
        });

        const combinedText = matchingKeys
            .sort((a, b) => parseR(a).start - parseR(b).start)
            .map(key => chapterData[key])
            .join(" ");

        let isHighlighted = false;
        if (systemBcv && Number(systemBcv.chapterNum) === Number(chapter)) {
            const sys = parseR(systemBcv.verseNum);
            isHighlighted = Math.max(sys.start, unit.start) <= Math.min(sys.end, unit.end);
        }

        return { text: combinedText, isHighlighted, unitStart: unit.start };
    };

    let chapterN = "0";

    return (
        <Box dir={selectedBurritoTextDir}>
            {section.paragraphs?.map((p, n) => {
                if (p.units) {
                    const [c] = p.units[0].split(":");
                    const newChapter = c !== chapterN;
                    if (newChapter) chapterN = c;

                    return (
                        <div key={n}>
                            {newChapter && <div className="marks_chapter_label">{c}</div>}
                            <div className={p.paraTag}>
                                {p.units.map((cv, n2) => {
                                    const [uC, uV] = cv.split(":");
                                    const { text, isHighlighted, unitStart } = getVerseData(uC, uV);
                                    
                                    const sysStart = Number(String(systemBcv?.verseNum || "").split('-')[0]);
                                    const isScrollTarget = isHighlighted && unitStart === sysStart;

                                    return (
                                        <span key={`${n}-${n2}`} ref={isScrollTarget ? activeVerseRef : null}>
                                            <span className="marks_verses_label">{uV}</span>
                                            <span style={{ backgroundColor: isHighlighted ? "#CCC" : "transparent" }}>
                                                {text}{" "}
                                            </span>
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    );
                }
                return <div key={n} className={p.paraTag}>{section.fieldInitialValues?.[p.name]}</div>;
            })}
        </Box>
    );
}

export default ScriptureField;