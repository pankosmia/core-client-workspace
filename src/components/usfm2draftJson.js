const PARSE_CACHE_MAX = 5;
const parseCache = new Map();

let worker;
let reqId = 0;
const pending = new Map();

function getWorker() {
  if (!worker) {
    worker = new Worker(
      new URL("./usfm2draftJson.worker.js", import.meta.url),
      { type: "module" },
    );
    worker.addEventListener("message", (e) => {
      const { id, ok, result, error } = e.data;
      const p = pending.get(id);
      if (!p) return;
      pending.delete(id);
      ok ? p.resolve(result) : p.reject(new Error(error));
    });
  }
  return worker;
}

export default function usfm2draftJson(usfm) {
  if (!usfm) return Promise.resolve({ headers: {}, blocks: [] });
  const cached = parseCache.get(usfm);
  if (cached) {
    parseCache.delete(usfm);
    parseCache.set(usfm, cached);
    return Promise.resolve(cached);
  }
  const id = ++reqId;
  return new Promise((resolve, reject) => {
    pending.set(id, {
      resolve: (result) => {
        parseCache.set(usfm, result);
        if (parseCache.size > PARSE_CACHE_MAX) {
          parseCache.delete(parseCache.keys().next().value);
        }
        resolve(result);
      },
      reject,
    });
    getWorker().postMessage({ id, usfm });
  });
}
