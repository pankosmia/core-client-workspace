import {Typography} from "@mui/material";

function SectionReference({section}) {
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
            {section.cv.join('-')}
        </Typography>
    </div>
}

export default SectionReference;