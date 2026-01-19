import { Grid2, ToggleButton, ToggleButtonGroup } from "@mui/material";
import SvgViewEditorBottom from "../../munchers/TextTranslation/SimplifiedEditor/layouts/view_editor_bottom";
import SvgViewEditorLeftColumn from "../../munchers/TextTranslation/SimplifiedEditor/layouts/view_editor_left_column";
import SvgViewEditorRightColumn from "../../munchers/TextTranslation/SimplifiedEditor/layouts/view_editor_right_column";
import SvgViewEditorLeftRow from "../../munchers/TextTranslation/SimplifiedEditor/layouts/view_editor_left_row";
import SvgViewEditorRightRow from "../../munchers/TextTranslation/SimplifiedEditor/layouts/view_editor_right_row";
import SvgViewEditorTop from "../../munchers/TextTranslation/SimplifiedEditor/layouts/view_editor_top";
import SvgViewEditorTopDisabled from "../../munchers/TextTranslation/SimplifiedEditor/layouts/view_editor_top_disabled";
import SvgViewEditorBottomDisabled from "../../munchers/TextTranslation/SimplifiedEditor/layouts/view_editor_bottom_disabled";
import SvgViewEditorLeftColumnDisabled from "../../munchers/TextTranslation/SimplifiedEditor/layouts/view_editor_left_column_disabled";
import SvgViewEditorLeftRowDisabled from "../../munchers/TextTranslation/SimplifiedEditor/layouts/view_editor_left_row_disabled";
import SvgViewEditorRightRowDisabled from "../../munchers/TextTranslation/SimplifiedEditor/layouts/view_editor_right_row_disabled";
import SvgViewEditorRightColumnDisabled from "../../munchers/TextTranslation/SimplifiedEditor/layouts/view_editor_right_column_disabled";
import { useEffect, useState } from "react";

export default function LayoutPicker({ selectedResources, layout, setLayout }) {
    const [alignment, setAlignment] = useState(selectedResources.size === 0 ? "" : layout);

    const handleAlignment = (newAlignment) => {
        setAlignment(newAlignment);
    };
    useEffect(
        () => {
            if (selectedResources.size === 0) {
                setAlignment("")
            } else
                setAlignment(layout)
        },
        [selectedResources, layout]
    );
    const layouts = [
        {
            value: "ViewEditorTop",
            layout: "ViewEditorTop",
            Icon: SvgViewEditorTop,
            IconDisabled: SvgViewEditorTopDisabled,
        },
        {
            value: "ViewEditorBottom",
            layout: "ViewEditorBottom",
            Icon: SvgViewEditorBottom,
            IconDisabled: SvgViewEditorBottomDisabled,
        },
        {
            value: "ViewEditorLeftColumn",
            layout: "ViewEditorLeftColumn",
            Icon: SvgViewEditorLeftColumn,
            IconDisabled: SvgViewEditorLeftColumnDisabled,
        },
        {
            value: "ViewEditorRightColumn",
            layout: "ViewEditorRightColumn",
            Icon: SvgViewEditorRightColumn,
            IconDisabled: SvgViewEditorRightColumnDisabled,
        },
        {
            value: "ViewEditorLeftRow",
            layout: "ViewEditorLeftRow",
            Icon: SvgViewEditorLeftRow,
            IconDisabled: SvgViewEditorLeftRowDisabled,
        },
        {
            value: "ViewEditorRightRow",
            layout: "ViewEditorRightRow",
            Icon: SvgViewEditorRightRow,
            IconDisabled: SvgViewEditorRightRowDisabled,
        },
    ];

    return (
        <Grid2 display="flex" gap={1}>
            <ToggleButtonGroup
                value={alignment}
                exclusive
                onChange={handleAlignment}
            >
                {layouts.map(({ value, layout, Icon, IconDisabled }) => (
                    <ToggleButton
                        key={value}
                        value={value}
                        onClick={() => setLayout(layout)}
                        disabled={selectedResources.size === 0}
                    >
                        {selectedResources.size === 0 ? (
                            <IconDisabled />
                        ) : (
                            <Icon />
                        )}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </Grid2>

    );
}