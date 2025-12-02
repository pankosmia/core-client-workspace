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
                    t => {
                        switch (t.type) {
                            case "chapter":
                                return <StoryChapter type={t} />

                            case "remark":
                                return <StoryRemark type={t} />

                            case "main":
                                return <StoryBibleBlock type={t} />

                            default:
                                return <StoryGraft type={t} />
                        }

                    }


                )}
        </div>

    );


}