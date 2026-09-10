import { Proskomma } from "proskomma-core";

const XCONTENT_RE = /^attribute\/milestone\/zaln\/x-content\/\d+\/(.+)$/;

function getSourcesForToken(scopes) {
  if (!scopes) return [];
  return scopes
    .map((s) => s.match(XCONTENT_RE))
    .filter(Boolean)
    .map((m) => m[1]);
}

function processGraftItems(items) {
  let ret = [""];
  for (const item of items) {
    if (item.type === "token") {
      ret[0] += item.payload;
      if (ret[0] === "___") {
        ret[0] = "";
      }
    }
  }
  if (ret[0].trim().length === 0) {
    ret[0] = "_";
  }
  return ret;
}

function processCvItems(items, os, chapterNo, newChapter) {
  let ret = [];
  const openVerse = os.filter((s) => s.payload.startsWith("verses"))[0];
  if (openVerse && !newChapter) {
    ret.push({
      chapter: chapterNo,
      verses: openVerse.payload.split("/")[1],
      content: [],
    });
  }

  for (const item of items) {
    if (item.subType === "start" && item.payload.startsWith("verses")) {
      ret.push({
        chapter: chapterNo,
        verses: item.payload.split("/")[1],
        content: [],
      });
    } else if (item.type === "token") {
      const text = item.payload.replace(/\s+/g, " ");
      const sources = getSourcesForToken(item.scopes);
      ret[ret.length - 1].content.push({
        target: text,
        source: sources.length > 0 ? sources : null,
      });
    }
  }

  ret = ret.map((vo) => {
    const joined = vo.content
      .map((w) => w.target)
      .join("")
      .trim();
    let content = vo.content;
    if (joined === "___" || joined.length === 0) {
      content = [{ target: "_", source: null }];
    }
    return {
      ...vo,
      content,
    };
  });
  return ret;
}

function processBlocks(blocks, sequenceType, sequences) {
  let ret = [];
  let chapterNo = 0;
  for (const block of blocks) {
    let newChapter = false;
    if (block.bs.payload.split("/")[1] === "hangingGraft") {
      continue;
    }
    let blockChapterOb = [
      ...block.is.filter((s) => s.payload.startsWith("chapter")),
      ...block.os.filter((s) => s.payload.startsWith("chapter")),
    ][0];
    if (blockChapterOb) {
      const blockChapter = parseInt(blockChapterOb.payload.split("/")[1]);
      if (blockChapter !== chapterNo) {
        chapterNo = blockChapter;
        newChapter = true;
        ret.push({
          type: "chapter",
          chapter: chapterNo,
        });
      }
    }
    for (const bg of block.bg) {
      const graftedSequence = sequences.filter((s) => s.id === bg.payload)[0];
      ret = [
        ...ret,
        ...processBlocks(
          graftedSequence.blocks,
          graftedSequence.type,
          sequences,
        ),
      ];
    }
    const blockOb = {
      type: sequenceType,
    };
    if (sequenceType !== "remark") {
      blockOb.tag = block.bs.payload.split("/")[1];
    }
    if (sequenceType === "main") {
      blockOb.units = processCvItems(
        block.items,
        block.os,
        chapterNo,
        newChapter,
      );
    } else {
      blockOb.content = processGraftItems(block.items);
    }
    ret.push(blockOb);
  }
  return ret;
}

function parseUsfm2viewerJson(usfm) {
  const pk = new Proskomma();
  pk.importDocument({ abbr: "xxx", lang: "yyy" }, "usfm", usfm);
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
                    items {
                      type
                      subType
                      payload
                      scopes(startsWith: ["attribute/milestone/zaln"])
                    }
                }
            }
        }
    }`;
  const document = pk.gqlQuerySync(query).data.documents[0];
  const headers = Object.fromEntries(
    document.headers.map((kv) => [kv.key, kv.value]),
  );
  const mainSequence = document.sequences.filter((s) => s.type === "main")[0];
  const blocks = processBlocks(
    mainSequence.blocks,
    mainSequence.type,
    document.sequences,
  );
  return {
    headers,
    blocks,
  };
}

self.onmessage = (e) => {
  try {
    const result = parseUsfm2viewerJson(e.data.usfm);

    self.postMessage({
      ok: true,
      result,
    });
  } catch (err) {
    self.postMessage({
      ok: false,
      error: {
        name: err?.name,
        message: err?.message,
        stack: err?.stack,
      },
    });
  }
};
