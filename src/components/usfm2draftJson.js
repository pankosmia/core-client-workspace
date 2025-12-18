import { Proskomma } from 'proskomma-core';

function processGraftItems(items) {
    let ret = [""];
    for (const item of items) {
        if (item.type === "token") {
            ret[0] += item.payload;
        }
    }
    return ret;
}

function processCvItems(items, os, chapterNo) {
    let ret = [];
    // start empty verse if open
    const openVerse = os.filter(s => s.payload.startsWith("verses"))[0];
    if (openVerse) {
        ret.push(
            {
                chapter: chapterNo,
                verses: openVerse.payload.split("/")[1],
                content: [""]
            }
        );
    }
    // Build content, push chapters, start over on verses
    for (const item of items) {
        if (item.subType === "start" && item.payload.startsWith("verses")) {
            ret.push(
                {
                    chapter: chapterNo,
                    verses: item.payload.split("/")[1],
                    content: [""]
                }
            );
        } else if (item.type === "token") {
            ret[ret.length - 1].content[0] += item.payload.replace(/\s+/g," ");
            // if (ret[ret.length - 1].content[0] === '___') {
            //     ret[ret.length - 1].content[0] = ""
            // }
        }
    }
    return ret;
}

function processBlocks(blocks, sequenceType, sequences) {
    let ret = [];
    let chapterNo = 0;
    for (const block of blocks) {
        if (block.bs.payload.split("/")[1] === "hangingGraft") {
            continue;
        }
        let blockChapterOb = [...block.is.filter(s => s.payload.startsWith("chapter")), ...block.os.filter(s => s.payload.startsWith("chapter"))][0];
        if (blockChapterOb) {
            const blockChapter = parseInt(blockChapterOb.payload.split("/")[1]);
            if (blockChapter !== chapterNo) {
                chapterNo = blockChapter;
                ret.push(
                    {
                        type: "chapter",
                        chapter: chapterNo
                    }
                );
            }
        }
        for (const bg of block.bg) {
            const graftedSequence = sequences.filter(s => s.id === bg.payload)[0];
            ret = [...ret, ...processBlocks(graftedSequence.blocks, graftedSequence.type, sequences)];
        }
        const blockOb =
        {
            type: sequenceType,
        }
        if (sequenceType !== "remark") {
            blockOb.tag = block.bs.payload.split("/")[1]
        }
        if (sequenceType === "main") {
            blockOb.units = processCvItems(block.items, block.os, chapterNo)
        } else {
            blockOb.content = processGraftItems(block.items)
        }
        ret.push(blockOb);

    }
    return ret;
}


export default function usfm2draftJson(usfm) {
    const pk = new Proskomma();
    pk.importDocument({ abbr: "xxx", "lang": "yyy" }, "usfm", usfm);
    const query = `{
        documents {
            headers {key value}
            sequences {
                id
                type
                blocks {
                    bs {payload}
                    bg {payload}
                    os {payload}
                    is {payload}
                    items {type subType payload}
                }
            }
        }
    }`;
    const document = pk.gqlQuerySync(query).data.documents[0];
    const headers = Object.fromEntries(
        document.headers
            .map(
                kv => [kv.key, kv.value]
            )
    );
    const mainSequence = document.sequences.filter(s => s.type === "main")[0];
    const blocks = processBlocks(mainSequence.blocks, mainSequence.type, document.sequences);
    return {
        headers,
        blocks

    }

};