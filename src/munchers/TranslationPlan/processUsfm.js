import {Proskomma} from "proskomma-core";
import TextDir from '../helpers/TextDir';

function processUsfm(usfm) {
    const pk = new Proskomma();
    pk.importDocument({
            lang: "xxx",
            abbr: "yyy"
        },
        "usfm",
        usfm
    );
    const query = `{
            documents {
                header(id: "bookCode")
                cvIndexes {
                chapter
                verses {
                    verse {
                    verseRange
                    text
                    }
                }
                }
            }
        }`;
    const result = pk.gqlQuerySync(query);
    return Object.fromEntries(
        result.data.documents[0].cvIndexes
            .map(
                i => [
                    i.chapter,
                    Object.fromEntries(
                        i.verses
                            .map(
                                (v, n) => [
                                    `${n}`,
                                    v.verse.length > 0 ?
                                        v.verse[0].text :
                                        []
                                ]
                            )
                            .filter(kv => typeof kv[1] === "string")
                    )
                ]
            )
    )
}

export default processUsfm;