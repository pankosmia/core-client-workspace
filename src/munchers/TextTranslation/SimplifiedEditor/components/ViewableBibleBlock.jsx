import {useContext, useEffect} from "react";
import {bcvContext} from "pithekos-lib";

export default function ViewableBibleBlock({blockJson }) {

    const {systemBcv} = useContext(bcvContext);

    return <div className={blockJson.tag}>
        {blockJson?.units?.map((u, i) => {
            console.log("system", systemBcv);
            console.log("u.verses", u.verses);
            return <span style={(systemBcv.verseNum === Number(u.verses)) ? { backgroundColor: "#CCC" } : {}}>
                <span className="marks_verses_label">{u.verses}</span>
                <span style={{ paddingRight: "2pt" }} >{u.content[0]}</span>
            </span>
        })}
    </div>;
}