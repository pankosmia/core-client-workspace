import { Typography } from "@mui/material";
import { useContext } from "react";
import GraphiteTest from "../../pages/Workspace/GraphiteTest";
import { typographyContext } from "pankosmia-rcl";
function NonScriptureField({ key, planIngredient, section, field }) {
  const { typographyRef } = useContext(typographyContext);
  const styleParaTag = field.paraTag || "";
  const value =
    section.fieldInitialValues[field.name] ||
    planIngredient.fieldInitialValues[field.name] ||
    "";
  if (!value) {
    return "";
  }
  const isGraphite = GraphiteTest();
  /** adjSelectedFontClass reshapes selectedFontClass if Graphite is absent. */
  const adjSelectedFontClass = isGraphite
    ? typographyRef.current.font_set
    : typographyRef.current.font_set.replace(
        /Pankosmia-AwamiNastaliq(.*)Pankosmia-NotoNastaliqUrdu/gi,
        "Pankosmia-NotoNastaliqUrdu",
      );
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "start",
        textAlign: "left",
      }}
      key={key}
    >
      <Typography
        sx={{
          fontSize: "medium",
          paddingRight: "1em",
        }}
      >
        {styleParaTag}
      </Typography>

      <Typography
        sx={{ fontFamily: "adjSelectedFontClass" }}
        className={styleParaTag}
        size="small"
      >
        {value}
      </Typography>
    </div>
  );
}

export default NonScriptureField;
