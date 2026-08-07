import { SaveOutlined } from "@mui/icons-material";
import {
  AppBar,
  Box,
  ButtonGroup,
  Icon,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
} from "@mui/material";
import LayoutIcon from "../munchers/TextTranslation/SimplifiedEditor/layouts/LayoutIcon";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { doI18n } from "pankosmia-lib/i18n";
import { useContext, useEffect, useState } from "react";
import {
  bcvContext as BcvContext,
  debugContext as DebugContext,
  i18nContext as I18nContext,
  productContext as ProductContext,
} from "pankosmia-rcl";
import { getJson, postEmptyJson } from "pankosmia-lib/http";
import { useNavigate } from "react-router-dom";

export default function ToolbarComp({
  actions = [],
  save,
  disabledSave,
  disabledLayout,
  contentBooks,
  scriptDirection,
  previousChapter,
  nextChapter,
  chapterNumbers,
  currentPosition,
  changeBook,
  changeChapter,
}) {
  const { bcvRef } = useContext(BcvContext);
  const { debugRef } = useContext(DebugContext);
  const { i18nRef } = useContext(I18nContext);
  const { product } = useContext(ProductContext);
  const navigate = useNavigate();

  const layout = () => {
    navigate({
      pathname: "/",
      search: "return-page=workspace",
    });
  };
  return (
    <AppBar
      position="static"
      sx={{
        display: "flex",
        flexDirection: "row",
        backgroundColor: "inherit",
        borderBottom: "1px solid #ccc",
        boxShadow: "none",
      }}
    >
      {/* Save Button */}
      <IconButton onClick={() => save()} disabled={disabledSave}>
        <SaveOutlined />
      </IconButton>

      {/* Layout Button */}
      <Tooltip
        title={doI18n(
          "pages:core-local-workspace:button_edit_layout",
          i18nRef.current,
          debugRef.current,
        )}
      >
        <IconButton disabled={disabledLayout} onClick={() => layout()}>
          <LayoutIcon />
        </IconButton>
      </Tooltip>
      {actions.map((action) => {
        if (action.type === "component") {
          return <Box key={action.key}>{action.render()}</Box>;
        }
        return (
          <Tooltip key={action.key} title={action.tooltip}>
            <span>
              <IconButton onClick={action.onClick} disabled={action.disabled}>
                {action.icon}
              </IconButton>
            </span>
          </Tooltip>
        );
      })}
    </AppBar>
  );
}
