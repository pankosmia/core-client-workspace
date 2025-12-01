import PropTypes from "prop-types";

export default function StoryBibleBlock({ scriptureJson }) {

    StoryBibleBlock.propTypes = {
        scriptureJson: PropTypes.object
    }

    return (
        <div>
            {scriptureJson.blocks
                .map(
                    t => {
                        if (t.type !== "main") {
                            return (
                                <>
                                    <div style={{ flexDirection: "column" }}>
                                        <span>{t.tag} </span>
                                        <span> {t.content}</span>
                                    </div>
                                </>

                            )
                        } else {
                            return  <div style={{ flexDirection: "column" }}>
                                        <span>{t.tag} </span>
                                        <span> {t.units.map(u => u.content.join("")).join(" ")}</span>
                                    </div>
  
                        }


                    }


                )}
        </div>

    );


}