function updateGraftContent(scriptureJson, position, newValue) {
    return {
        headers: scriptureJson.headers,
        blocks: scriptureJson.blocks.map(
            (b, n) => {
                if (n === position[0]) {
                    const newBlock = {...b, content: [newValue]};
                    console.log(newBlock);
                    return newBlock;
                } else {
                    return b;
                }
            }
        )
    }
}

export {updateGraftContent}