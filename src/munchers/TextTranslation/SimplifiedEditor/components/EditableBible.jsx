import EditableBibleBlock from "./EditableBibleBlock";
import EditableGraft from "./EditableGraft";
import EditableRemark from "./EditableRemark";
import {useContext, useEffect} from "react";
import {bcvContext} from "pankosmia-rcl";

export default function EditableBible({chapterJson, scriptureJson, setScriptureJson }) {

    const {systemBcv} = useContext(bcvContext);

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
                    (b, n) => {
                        switch (b.type) {
                            case "chapter":
                                return ""

                            case "remark":
                                return <EditableRemark key={`${systemBcv.bookCode}-${systemBcv.chapterNum}-${n}`} scriptureJson={scriptureJson} setScriptureJson={setScriptureJson} position={[b.position]}/>

                            case "main":
                                return <EditableBibleBlock key={`${systemBcv.bookCode}-${systemBcv.chapterNum}-${n}`} scriptureJson={scriptureJson} setScriptureJson={setScriptureJson} position={[b.position]}/>

                            default:
                                return <EditableGraft key={`${systemBcv.bookCode}-${systemBcv.chapterNum}-${n}`} scriptureJson={scriptureJson} setScriptureJson={setScriptureJson} position={[b.position]}/>
                        }

                    }


                )}
        </div>

    );


}