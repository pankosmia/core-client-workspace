import {Typography} from "@mui/material";

function SectionReference({section}) {

    const formatSectionRange = (cvArray) => {
        if (!cvArray || cvArray.length < 2) return "";
    
        const startPart = cvArray[0].split('-')[0];

        const endFull = cvArray[1];
        const chapter = endFull.split(':')[0];
        const verses = endFull.split(':')[1];

        const lastVerse = verses.includes('-') ? verses.split('-')[1] : verses;
        
        const endPart = `${chapter}:${lastVerse}`;
    
        return `${startPart}-${endPart}`;
    };
    
    return <div
        style={{
            display: "flex",
            flexDirection: "row",
            fontFamily: "monospace",
            fontSize: "medium",
        }}>
        <Typography
            sx={{
                padding: "5px",
                background: "lightgray",
                borderRadius: "4px 0px 0px 4px",
                alignSelf: "center"
            }}>
            {"//"}
        </Typography>
        <Typography
            sx={{
                padding: "5px",
                background: "lightgray",
                borderRadius: "0px 4px 4px 0px"
            }}
        >
            {section?.cv && `(${formatSectionRange(section.cv)})`}
        </Typography>
    </div>
}

export default SectionReference;