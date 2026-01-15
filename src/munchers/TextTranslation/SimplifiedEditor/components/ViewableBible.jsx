import {useContext, useEffect} from "react";
/* import {bcvContext} from "pithekos-lib"; */
import ViewableBibleBlock from "./ViewableBibleBlock";

export default function ViewableBible({chapterJson }) {

/*     const {systemBcv} = useContext(bcvContext);*/

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

    console.log("ELIAS DEBUG: chapterJson", chapterJson);

    return (
        <div>
            {chapterJson.blocks
                .map(
                    (b, n) => {
                        switch (b.type) {
                            case "chapter":
                                console.log("debug chapter");
                                return ""

                            case "remark":
                                console.log("debug remark");
                                return <ViewableBibleBlock blockJson={b} />

                            case "main":
                                console.log("debug main");
                                return <ViewableBibleBlock blockJson={b} />

                            default:
                                console.log("debug default");
                                return <ViewableBibleBlock blockJson={b} />
                        }
                    }
                )}
        </div>
    );
}