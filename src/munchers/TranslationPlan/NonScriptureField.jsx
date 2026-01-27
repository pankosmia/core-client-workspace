import {Typography} from "@mui/material";

function NonScriptureField({key, planIngredient, section, field}) {
    const styleParaTag = field.paraTag || "";
    const value =
        section.fieldInitialValues[field.name] ||
        planIngredient.fieldInitialValues[field.name] ||
        "";
    if (!value) {
        return "";
    }
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                textAlign: "left"
            }}
            key={key}
        >
            <Typography
                sx={{
                    fontFamily: "monospace",
                    fontSize: "medium",
                    paddingRight: "1em",
                }}
            >
                {styleParaTag}
            </Typography>

            <Typography
                className={styleParaTag}
                size="small"
            >
                {value}
            </Typography>
        </div>
    );
}

export default NonScriptureField;