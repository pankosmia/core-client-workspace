// Make chapter content from whole book content
export default function filterByChapter(usfmJson, requiredChapter) {
    let chapterBlocks = [];
    let waitingBlocks = [];
    let currentChapter = 0;
    let blockN = 0;
    for (const block of usfmJson.blocks) {
        if (!["main", "chapter"].includes(block.type)) {
            waitingBlocks.push({...block, position: blockN});
            blockN += 1;
            continue;
        }
        if (block.type === "chapter") {
            currentChapter = block.chapter
        }
        if (currentChapter === requiredChapter) {
            for (const waitingBlock of waitingBlocks) {
                chapterBlocks.push(waitingBlock);
            }
            chapterBlocks.push({...block, position: blockN});
        }
        waitingBlocks = [];
        blockN += 1
    }
    return {
        headers: usfmJson.headers,
        blocks: chapterBlocks
    }
}