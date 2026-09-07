const PARSE_CACHE_MAX = 5;
const parseCache = new Map();

export default function usfm2draftJson(usfm) {
  if (!usfm) {
    return Promise.resolve({
      headers: {},
      blocks: [],
    });
  }

  // Check cache first
  const cached = parseCache.get(usfm);

  if (cached) {
    parseCache.delete(usfm);
    parseCache.set(usfm, cached);

    return Promise.resolve(cached);
  }

  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("./usfm2draftJson.worker.js", import.meta.url),
      {
        type: "module",
      },
    );

    worker.addEventListener("message", (e) => {
      const { ok, result, error } = e.data;

      // Worker is finished, so we don't need it anymore
      worker.terminate();

      if (!ok) {
        reject(new Error(error));
        return;
      }

      // Update cache
      parseCache.set(usfm, result);

      if (parseCache.size > PARSE_CACHE_MAX) {
        parseCache.delete(parseCache.keys().next().value);
      }

      resolve(result);
    });

    worker.addEventListener("error", (error) => {
      worker.terminate();
      reject(error);
    });

    worker.postMessage({ usfm });
  });
}
