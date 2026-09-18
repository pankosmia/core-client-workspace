const PARSE_CACHE_MAX = 5;
const parseCache = new Map();

export default function usfm2viewerJson(usfm) {
  if (!usfm) {
    return Promise.resolve({
      headers: {},
      blocks: [],
    });
  }

  const cached = parseCache.get(usfm);

  if (cached) {
    parseCache.delete(usfm);
    parseCache.set(usfm, cached);

    return Promise.resolve(cached);
  }

  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("./usfm2viewerJson.worker.js", import.meta.url),
      {
        type: "module",
      },
    );

    const cleanup = () => {
      worker.terminate();
    };

    worker.addEventListener("message", (e) => {
      const { ok, result, error } = e.data;

      if (!ok) {
        cleanup();

        const err = new Error(error?.message || "Unknown worker error");
        err.name = error?.name || "WorkerError";

        if (error?.stack) {
          err.stack = error.stack;
        }

        console.error("USFM viewer worker error:", err);

        reject(err);
        return;
      }

      cleanup();

      parseCache.set(usfm, result);

      if (parseCache.size > PARSE_CACHE_MAX) {
        parseCache.delete(parseCache.keys().next().value);
      }

      resolve(result);
    });

    worker.addEventListener("error", (error) => {
      cleanup();

      console.error("Uncaught USFM viewer worker error:", error);

      reject(error);
    });

    worker.postMessage({ usfm });
  });
}
