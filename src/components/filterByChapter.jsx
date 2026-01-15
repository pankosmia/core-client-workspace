// Make chapter content from whole book content
export default function filterByChapter(usfmJson, requiredChapter) {
    let chapterBlocks = [];
    let currentChapter = 0;
    let blockN = 0;
    for (const block of usfmJson.blocks) {
        if (block.type === "chapter") {
            currentChapter = block.chapter
        }
        if (currentChapter === requiredChapter) {
            chapterBlocks.push({...block, position: blockN})
        }
        blockN += 1
    }
    return {
        headers: usfmJson.headers,
        blocks: chapterBlocks
    }
};