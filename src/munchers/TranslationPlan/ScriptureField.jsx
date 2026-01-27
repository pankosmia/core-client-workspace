import {
    Box,
    Typography
} from "@mui/material";
import {i18nContext, doI18n, bcvContext} from "pithekos-lib";
import {useContext} from "react";

function ScriptureField({key, section, verseText, selectedBurritoTextDir}) {
    const {i18nRef} = useContext(i18nContext);
    const {systemBcv} = useContext(bcvContext);

    if (Object.keys(verseText).length > 0) {
        let chapterN = "0"
        return (<Box dir={selectedBurritoTextDir} key={key}>
            {section.paragraphs
                .map((p, n) => {
                    if (p.units) {
                        const c = p.units[0].split(":")[0]
                        const newChapter = c !== chapterN
                        if (newChapter) {
                            chapterN = c
                        }
                        return (
                            <div key={n}>
                                {
                                    newChapter && <div
                                        className="marks_chapter_label">{c}</div>
                                }
                                <div className={p.paraTag}>
                                    {
                                        p.units.map(
                                            (cv, n2) => <span key={`${n}-${n2}`}
                                            >
                                                        <span
                                                            className="marks_verses_label">
                                                            {cv.split(":")[1]}
                                                        </span>
                                                        <span style={{
                                                            backgroundColor: `${systemBcv.chapterNum}` === cv.split(":")[0] && `${systemBcv.verseNum}` === cv.split(":")[1] ?
                                                                "#CCC" :
                                                                "#FFF"
                                                        }}>
                                                            {verseText[cv.split(":")[0]][cv.split(":")[1]]}
                                                        </span>
                                                    </span>
                                        )
                                    }
                                </div>
                            </div>
                        )
                    } else {
                        return <div className={p.paraTag}>
                            {section.fieldInitialValues[p.name]}
                            {" "}
                            ({p.cv.join(" - ")})
                        </div>
                    }
                })}
        </Box>);
    } else {
        return <Typography><b><i>{doI18n("pages:core-local-workspace:no_scripture_for_story", i18nRef.current)}</i></b></Typography>
    }
}

export default ScriptureField;