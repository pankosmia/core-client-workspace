import React, { useRef, useContext, useEffect } from "react";
import ViewableBibleBlock from "./ViewableBibleBlock";
import { bcvContext /* , wordContext  */ } from "pankosmia-rcl";

export default function ViewableBible({ chapterJson, dir, word }) {
  const { systemBcv } = useContext(bcvContext);
  /* const { systemWord } = useContext(wordContext); */
  console.log(word);
  const lastPrintedVerseRef = useRef(null);

  useEffect(() => {
    async function loadCSS() {
      const url = "/api/app-resources/usfm/bible_page_styles.css";
      const response = await fetch(url);
      if (!response.ok) {
        console.error("Erreur de chargement du CSS :", response.status);
        return;
      }
      const cssText = await response.text();
      const style = document.createElement("style");
      style.textContent = cssText;
      document.head.appendChild(style);
    }
    loadCSS();
  }, []);

  //console.log('passed: ' + dir)

  return (
    <div style={{ padding: "2px 12px" }} dir={dir}>
      {chapterJson.blocks.map((b, n) => {
        if (b.tag === "b") {
          return <div key={n} style={{ height: "1em" }} />;
        }
        switch (b.type) {
          case "chapter":
            return "";
          case "remark":
          case "main":
          default:
            return (
              <ViewableBibleBlock
                key={n}
                blockJson={b}
                systemBcv={systemBcv}
                /* systemWord={systemWord} */
                lastPrintedVerseRef={lastPrintedVerseRef}
                word={word}
              />
            );
        }
      })}
    </div>
  );
}
