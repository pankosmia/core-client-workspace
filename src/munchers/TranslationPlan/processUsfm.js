import {Proskomma} from "proskomma-core";
import TextDir from '../helpers/TextDir';

function processUsfm(usfm) {
    if (!usfm) return {};
    try {
        const pk = new Proskomma();
        pk.importDocument({ lang: "xxx", abbr: "yyy" }, "usfm", usfm);
        const query = `{
            documents {
                cvIndexes {
                    chapter
                    verses {
                        verse { verseRange text }
                    }
                }
            }
        }`;
        const result = pk.gqlQuerySync(query);

        const doc = result?.data?.documents?.[0];
        if (!doc) {
            return {};
        }

        const output = {};
        doc.cvIndexes.forEach(i => {
            const chapter = i.chapter.toString();
            output[chapter] = {};
            i.verses.forEach(v => {
                const range = v.verse?.[0]?.verseRange || "0";
                const fullText = v.verse.map(vObj => vObj.text).join(" ");
                output[chapter][range] = fullText;
            });
        });
        return output;
    } catch (e) {
        console.error(e);
        return {};
    }
}

export default processUsfm;