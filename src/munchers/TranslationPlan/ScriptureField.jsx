import {
    Box,
    Typography
} from "@mui/material";
import {i18nContext, doI18n, bcvContext} from "pithekos-lib";
import {useContext} from "react";

function ScriptureField({ section, verseText, selectedBurritoTextDir, systemBcv }) {
    
    const getVerseData = (chapter, verse) => {
        const chapterData = verseText?.[chapter.toString()] || {};
        const targetV = Number(verse);
    
        const foundKey = Object.keys(chapterData).find(key => {
            if (key === String(verse)) return true;
            if (key.includes('-')) {
                const [start, end] = key.split('-').map(Number);
                return targetV >= start && targetV <= end;
            }
            return false;
        });
    
        const isHighlighted = systemBcv && 
            Number(systemBcv.chapterNum) === Number(chapter) && 
            Number(systemBcv.verseNum) === targetV;
    
        return {
            text: foundKey ? chapterData[foundKey] : "",
            isHighlighted
        };
    };

    if (!verseText || Object.keys(verseText).length === 0) return null;

    let chapterN = "0";

    return (
        <Box dir={selectedBurritoTextDir}>
            {section.paragraphs?.map((p, n) => {
                if (p.units && p.units.length > 0) {
                    const [c] = p.units[0].split(":");
                    const newChapter = c !== chapterN;
                    if (newChapter) chapterN = c;

                    return (
                        <div key={n}>
                            {newChapter && <div className="marks_chapter_label">{c}</div>}
                            <div className={p.paraTag}>
                                {p.units.map((cv, n2) => {
                                    const [unitC, unitV] = cv.split(":");
                                    const { text, isHighlighted } = getVerseData(unitC, unitV);

                                    return (
                                        <span key={n2} style={{ 
                                            backgroundColor: isHighlighted ? "#CCC" : "transparent",
                                            padding: "2px 0"
                                        }}>
                                            <span className="marks_verses_label">{unitV}</span>
                                            {text}{" "}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    );
                }
                return null;
            })}
        </Box>
    );
}

export default ScriptureField;