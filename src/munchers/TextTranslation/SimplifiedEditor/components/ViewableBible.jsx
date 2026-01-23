import React, { useRef, useContext, useEffect } from 'react';
import ViewableBibleBlock from "./ViewableBibleBlock";
import {bcvContext} from "pithekos-lib";

export default function ViewableBible({chapterJson }) {

    const {systemBcv} = useContext(bcvContext);
    const lastPrintedVerseRef = useRef(null);

    useEffect(() => {
        async function loadCSS() {
            const url = "/app-resources/usfm/bible_page_styles.css";
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

    return (
        <div 
            style={{ 
                textAlign: "justify",
                padding: "2px 12px",
                wordBreak: "break-word"
            }}
        >
            {chapterJson.blocks
                .filter(b => b.tag !== 'b')
                .map(
                    (b, n) => {
                        switch (b.type) {
                            case "chapter": 
                                return ""
                            case "remark":
                            case "main":
                            default:
                                return (
                                    <ViewableBibleBlock
                                        key={n}
                                        blockJson={b}
                                        systemBcv={systemBcv}
                                        lastPrintedVerseRef={lastPrintedVerseRef}
                                    />
                                );
                        }
                    }
                )}
        </div>
    );
}