import PropTypes from "prop-types";
import StoryBibleBlock from "./StoryBibleBlock";
import StoryGraft from "./StoryGraft";
import StoryChapter from "./StoryChapter";
import StoryRemark from "./StoryRemark";
import { useEffect } from "react";

export default function ScriptureBible({ scriptureJson }) {

    ScriptureBible.propTypes = {
        scriptureJson: PropTypes.object
    }
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
            {scriptureJson.blocks
                .map(
                    (b,n) => {
                        switch (b.type) {
                            case "chapter":
                                return <StoryChapter block={b} position={[n]} />

                            case "remark":
                                return <StoryRemark block={b} position={[n]}/>

                            case "main":
                                return <StoryBibleBlock block={b} position={[n]}/>

                            default:
                                return <StoryGraft block={b} position={[n]}/>
                        }

                    }


                )}
        </div>

    );


}