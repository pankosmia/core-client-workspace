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

export default function LayoutPicker({ selectedResources,layout, setLayout }) {
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

    return (
        <Grid2 display="flex" gap={1}>
            <ToggleButtonGroup
                value={alignment}
                exclusive
                onChange={handleAlignment}
            >
                <ToggleButton value="ViewEditorTop" onClick={() => setLayout("ViewEditorTop")} disabled={selectedResources.size === 0}
                >
                    {selectedResources.size === 0 ?
                        (
                            <SvgViewEditorTopDisabled />
                        ) :
                        <SvgViewEditorTop />
                    }
                </ToggleButton>

                <ToggleButton value="ViewEditorBottom" onClick={() => setLayout("ViewEditorBottom")} disabled={selectedResources.size === 0}>
                    {selectedResources.size === 0 ?
                        (
                            <SvgViewEditorBottomDisabled />
                        ) :
                        <SvgViewEditorBottom />
                    }
                </ToggleButton>

                <ToggleButton value="ViewEditorLeftColumn" onClick={() => setLayout("ViewEditorLeftColumn")} disabled={selectedResources.size === 0}>
                    {selectedResources.size === 0 ?
                        (
                            <SvgViewEditorLeftColumnDisabled />
                        ) :
                        <SvgViewEditorLeftColumn />
                    }
                </ToggleButton>

                <ToggleButton value="ViewEditorRightColumn" onClick={() => setLayout("ViewEditorRightColumn")} disabled={selectedResources.size === 0}>
                    {selectedResources.size === 0 ?
                        (
                            <SvgViewEditorRightColumnDisabled />
                        ) :
                        <SvgViewEditorRightColumn />
                    }
                </ToggleButton>

                <ToggleButton value="ViewEditorLeftRow" onClick={() => setLayout("ViewEditorLeftRow")} disabled={selectedResources.size === 0}>

                    {selectedResources.size === 0 ?
                        (
                            <SvgViewEditorLeftRowDisabled />
                        ) :
                        <SvgViewEditorLeftRow />
                    }
                </ToggleButton>

                <ToggleButton value="ViewEditorRightRow" onClick={() => setLayout("ViewEditorRightRow")} disabled={selectedResources.size === 0}>
                    {selectedResources.size === 0 ?
                        (
                            <SvgViewEditorRightRowDisabled />
                        ) :
                        <SvgViewEditorRightRow />
                    }
                </ToggleButton>

            </ToggleButtonGroup>
        </Grid2>
    );
}