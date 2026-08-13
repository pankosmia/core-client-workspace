import { RepartitionRounded } from "@mui/icons-material";

function updateGraftContent(scriptureJson, position, newValue) {
  return {
    headers: scriptureJson.headers,
    blocks: scriptureJson.blocks.map((b, n) => {
      if (n === position[0]) {
        return { ...b, content: [newValue] };
      } else {
        return b;
      }
    }),
  };
}

function updateBlockTag(scriptureJson, position, newValue) {
  return {
    headers: scriptureJson.headers,
    blocks: scriptureJson.blocks.map((b, n) => {
      if (n === position[0]) {
        return { ...b, tag: newValue };
      } else {
        return b;
      }
    }),
  };
}

function splitPara(scriptureJson, caretPosition) {
  return {
    headers: scriptureJson.headers,
    blocks: scriptureJson.blocks
      .map((b, n) => {
        if (n === caretPosition.position[0]) {
          console.log("b", b, "n", n, "caret", caretPosition);
          const newBlocks = [
            {
              ...b,
              units: b.units.map((u, n2) => {
                if (n2 < caretPosition.position[1]) {
                  return u;
                } else if (n2 === caretPosition.position[1]) {
                  return {
                    ...u,
                    content: [u.content[0].slice(0, caretPosition.cp)],
                  };
                }
              }),
            },
            {
              ...b,
              units: b.units.map((u, n2) => {
                if (n2 > caretPosition.position[1]) {
                  return u;
                } else if (n2 === caretPosition.position[1]) {
                  return {
                    ...u,
                    content: [u.content[0].slice(caretPosition.cp)],
                  };
                }
              }),
            },
          ];
          return newBlocks;
        } else {
          return [b];
        }
      })
      .reduce((a, b) => [...a, ...b]),
  };
}

function updateUnitContent(scriptureJson, position, newValue) {
  return {
    headers: scriptureJson.headers,
    blocks: scriptureJson.blocks.map((b, n) => {
      if (n === position[0]) {
        const newBlock = {
          ...b,
          units: b.units.map((u, n) => {
            if (n === position[1]) {
              return {
                ...u,
                content: [newValue],
              };
            } else {
              return u;
            }
          }),
        };
        return newBlock;
      } else {
        return b;
      }
    }),
  };
}

export { updateGraftContent, updateBlockTag, updateUnitContent, splitPara };
