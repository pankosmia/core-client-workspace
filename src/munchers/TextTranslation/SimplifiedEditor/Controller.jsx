function updateGraftContent(scriptureJson, position, newValue) {
    return {
        headers: scriptureJson.headers,
        blocks: scriptureJson.blocks.map(
            (b, n) => {
                if (n === position[0]) {
                    return {...b, content: [newValue]};
                } else {
                    return b;
                }
            }
        )
    }
}

function updateUnitContent(scriptureJson, position, newValue) {
    return {
        headers: scriptureJson.headers,
        blocks: scriptureJson.blocks.map(
            (b, n) => {
                if (n === position[0]) {
                    const newBlock = {
                        ...b,
                        units: b.units.map(
                            (u, n) => {
                                if (n === position[1]) {
                                    return {
                                        ...u,
                                        content: [newValue]
                                    }
                                } else {
                                    return u;
                                }
                            }
                        )
                    };
                    return newBlock;
                } else {
                    return b;
                }
            }
        )
    }
}
export {updateGraftContent, updateUnitContent}