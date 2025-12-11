import PropTypes from "prop-types";
import EditableBibleBlock from "./EditableBibleBlock";
import EditableGraft from "./EditableGraft";
import EditableChapter from "./EditableChapter";
import EditableRemark from "./EditableRemark";
import { useEffect } from "react";

export default function EditableBible({ chapterJson, scriptureJson, setScriptureJson }) {

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
        <div>
            {chapterJson.blocks
                .map(
                    (b,n) => {
                        switch (b.type) {
                            case "chapter":
                                return <EditableChapter key={n} block={b} position={[n]} />

                            case "remark":
                                return <EditableRemark key={n} block={b} position={[n]}/>

                            case "main":
                                return <EditableBibleBlock key={n} filterScriptureJsonChapter={chapterJson} block={b} position={[n]}/>

                            default:
                                return <EditableGraft key={n} scriptureJson={scriptureJson} setScriptureJson={setScriptureJson} position={[b.position]}/>
                        }

                    }


                )}
        </div>

    );


}