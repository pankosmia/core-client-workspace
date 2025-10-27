import {useEffect, useState, useContext, useRef} from "react";
import {Box, Stack} from "@mui/material";
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';

import {
    i18nContext as I18nContext,
    debugContext as DebugContext,
    bcvContext as BcvContext,
    doI18n,
    getText
} from "pithekos-lib";

function VideoViewer({metadata, reference}) {
    return <Stack>
        <img
            src={`/burrito/ingredient/bytes/${metadata.local_path}?ipath=${reference.slice(2)}.jpg`}
            alt="resource image"
        />
    </Stack>
}
function BcvImagesViewerMuncher({metadata}) {
    const [ingredient, setIngredient] = useState([]);
    const [verseNotes, setVerseNotes] = useState([]);
    const {systemBcv} = useContext(BcvContext);
    const {debugRef} = useContext(DebugContext);
    const {i18nRef} = useContext(I18nContext);
    
    let [current, setCurrent] = useState(0);

    let previousSlide = () => {
        if (current === 0) setCurrent(verseNotes.length - 1);
        else setCurrent(current - 1);
    };

    let nextSlide = () => {
        if (current === verseNotes.length - 1) setCurrent(0);
        else setCurrent(current + 1);
    };

    const getAllData = async () => {
            const ingredientLink = `/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.tsv`;
            let response = await getText(ingredientLink, debugRef.current);
            if (response.ok) {
                setIngredient(
                    response.text
                        .split("\n")
                        .map(l => l.split("\t").map(f => f.replace(/\\n/g, "\n\n")))
                );
            }
        };

    useEffect(
        () => {
            getAllData().then();
        },
        [systemBcv]
    );

    useEffect(
        () => {
            const doVerseNotes = async () => {
                let ret = [];
                for (const row of ingredient
                .filter(l => l[0] === `${systemBcv.chapterNum}:${systemBcv.verseNum}`)) {
                    ret.push(row[6]);
                }
                setVerseNotes(ret);
                // Reset current index when verseNotes changes
                setCurrent(0);
            }
            doVerseNotes().then();
        },
        [ingredient]
    );

    const [ verseCaptions, setVerseCaptions ] = useState([]);

    useEffect(
        () => {
            if (verseNotes.length > 0){
            const doVerseCaptions = async () => {
                let captions = [];
                for (const v of verseNotes){
                    let response = await getText(`/burrito/ingredient/raw/${metadata.local_path}?ipath=${v.slice(2)}.txt`, debugRef.current);
                    if (response.ok){
                        captions = [...captions, response.text];
                    } else {
                        return "";
                    }
                }
                setVerseCaptions(captions);
            }
                doVerseCaptions().then();
            }
        },
        [verseNotes]
    );

    const get = async () => {
        const ingredientLink = `/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.tsv`;
        let response = await getText(ingredientLink, debugRef.current);
        if (response.ok) {
            setIngredient(
                response.text
                    .split("\n")
                    .map(l => l.split("\t").map(f => f.replace(/\\n/g, "\n\n")))
            );
        }
    };
    
    return (
        <Box className="h-full w-full flex flex-col overflow-hidden">
            <div className="flex flex-col items-center justify-center p-2">
                <h5>{`${metadata.name} (${systemBcv.bookCode} ${systemBcv.chapterNum}:${systemBcv.verseNum})`}</h5>
                {/* <h6>{doI18n("munchers:bcv_notes_viewer:title", i18nRef.current)}</h6> */}
            </div>
            <div className="flex-1 min-h-0 min-w-0 overflow-hidden p-2">
                {ingredient &&
                verseNotes.length > 0 ? 
                    <div className="relative w-full h-full overflow-hidden">

                        {/* Slider images */}
                        <div
                            className="flex transition-transform duration-300 ease-out h-full"
                            style={{
                                transform: `translateX(-${current * (100 / verseNotes.length)}%)`,
                                width: `${verseNotes.length * 100}%`,
                            }}
                        >
                            {verseNotes.map((v, n) => (
                                <div key={n} className="w-full h-full flex-shrink-0 flex items-center justify-center" style={{ width: `${100 / verseNotes.length}%` }}>
                                    {/* <img
                                        src={`/burrito/ingredient/bytes/${metadata.local_path}?ipath=${v.slice(2)}.jpg`}
                                        alt="resource image"
                                        className="w-full h-full object-contain"
                                    /> */}
                                    <video /* width="320" height="240" */ controls className="w-full h-full object-contain"/* object-cover */>
                                      <source src={`/burrito/ingredient/bytes/${metadata.local_path}?ipath=${v.slice(2)}.mp4`} type="video/mp4"/>
                                      {/* doI18n("munchers:video_links_viewer:offline_mode", i18nRef.current) */"video"}
                                  </video>
                                </div>
                            ))}
                        </div>

                        {/* Navigation buttons for the slider */}
                        <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-4">
                            <button
                                className="cursor-pointer pointer-events-auto bg-blue-300 hover:bg-blue-400 rounded-full p-1 text-white"
                                onClick={previousSlide}
                            >
                                <ArrowCircleLeftIcon />
                            </button>
                            <button
                                className="cursor-pointer pointer-events-auto bg-blue-300 hover:bg-blue-400 rounded-full p-1 text-white"
                                onClick={nextSlide}
                            >
                                <ArrowCircleRightIcon />
                            </button>
                        </div>

                        {/* Circle buttons bottom of the image */}
                        <div className="absolute inset-0 flex items-end justify-center pointer-events-none pb-16">
                            <div className="flex justify-center gap-3 pointer-events-none">
                                {verseNotes.map((v, n) => {
                                    return (
                                        <div
                                            onClick={() => {
                                            setCurrent(n);
                                            }}
                                            key={"circle" + n}
                                            className={`rounded-full w-4 h-4 cursor-pointer pointer-events-auto hover:bg-opacity-80 border border-gray-300/30 shadow-sm ${
                                            n == current ? "bg-blue-300" : "bg-gray-700"
                                            }`}
                                        ></div>
                                    );
                                })}
                            </div>
                        </div>
                        
                        {/* Caption below the slider */}
                        <div className="absolute bottom-0 left-0 right-0 text-center py-4 px-4 text-base font-medium text-gray-800 bg-white bg-opacity-95 shadow-lg">
                            {`${verseCaptions[current]} (${current + 1} of ${verseNotes.length})`}
                            {/* {`${verseCaptions[current]}`} */}
                        </div>
                    </div> :
                    "No notes found for this verse"
                }
            </div>
        </Box>
    );
}

export default BcvImagesViewerMuncher;
