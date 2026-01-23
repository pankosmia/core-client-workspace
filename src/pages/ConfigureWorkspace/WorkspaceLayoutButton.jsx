import { Grid2, ToggleButton, ToggleButtonGroup } from "@mui/material";
import SvgViewEditorBottom from "../../munchers/TextTranslation/SimplifiedEditor/layouts/view_editor_bottom";
import SvgViewEditorLeftColumn from "../../munchers/TextTranslation/SimplifiedEditor/layouts/view_editor_left_column";
import SvgViewEditorRightColumn from "../../munchers/TextTranslation/SimplifiedEditor/layouts/view_editor_right_column";
import SvgViewEditorLeftRow from "../../munchers/TextTranslation/SimplifiedEditor/layouts/view_editor_left_row";
import SvgViewEditorRightRow from "../../munchers/TextTranslation/SimplifiedEditor/layouts/view_editor_right_row";
import SvgViewEditorTop from "../../munchers/TextTranslation/SimplifiedEditor/layouts/view_editor_top";
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
            icon: SvgViewEditorTop,
        },
        {
            value: "ViewEditorBottom",
            layout: "ViewEditorBottom",
            icon: SvgViewEditorBottom,
        },
        {
            value: "ViewEditorLeftColumn",
            layout: "ViewEditorLeftColumn",
            icon: SvgViewEditorLeftColumn,
        },
        {
            value: "ViewEditorRightColumn",
            layout: "ViewEditorRightColumn",
            icon: SvgViewEditorRightColumn,
        },
        {
            value: "ViewEditorLeftRow",
            layout: "ViewEditorLeftRow",
            icon: SvgViewEditorLeftRow,
        },
        {
            value: "ViewEditorRightRow",
            layout: "ViewEditorRightRow",
            icon: SvgViewEditorRightRow,
        },
    ];

    return (
        <Grid2 display="flex" gap={1}>
            <ToggleButtonGroup
                value={alignment}
                exclusive
                onChange={handleAlignment}
            >
                {layouts.map((item) => {
                    return (
                        <ToggleButton
                            key={item.value}
                            value={item.value}
                            onClick={() => setLayout(item.layout)}
                            disabled={selectedResources.size === 0}
                        >
                            <item.icon />
                        </ToggleButton>
                    );
                })}

            </ToggleButtonGroup>
        </Grid2>

    );
}