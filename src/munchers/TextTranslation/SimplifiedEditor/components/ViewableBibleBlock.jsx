import {useContext, useEffect, useRef} from "react";
import {bcvContext} from "pithekos-lib";

export default function ViewableBibleBlock({ blockJson }) {
    const { systemBcv } = useContext(bcvContext);

    const versesRefs = useRef({});

    useEffect(() => {
        const verseToScroll = systemBcv.verseNum;  
        if (verseToScroll && versesRefs.current[verseToScroll]) {
            versesRefs.current[verseToScroll].scrollIntoView({
                behavior: "auto",
                block: "center",
            });
        }
    }, [systemBcv.verseNum]); 

    return (
        <div 
            className={blockJson.tag} 
            style={{ padding: "2px 12px",  width: "100%", boxSizing: "border-box" }}
        >
            {blockJson?.units?.map((u, i) => {
                const isSelected = Number(systemBcv.verseNum) === Number(u.verses);
                return (
                    <span 
                        key={`${u.verses}-${i}`}
                        ref={(el) => (versesRefs.current[u.verses] = el)}
                        style={isSelected ? { backgroundColor: "#CCC" } : {}}
                    >
                        <span className="marks_verses_label">{u.verses}</span>
                        <span style={{ paddingRight: "2pt" }}>{u.content[0]}</span>
                    </span>
                );
            })}
        </div>
    );
}