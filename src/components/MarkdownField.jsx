import { useState } from "react";
import Markdown from 'react-markdown';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import CreateIcon from '@mui/icons-material/Create';
import { Box, ToggleButton, ToggleButtonGroup, TextareaAutosize, FormControl, FormLabel } from "@mui/material";

function MarkdownField({ currentRow, columnNames, onChangeNote, value, mode, fieldN, ingredient, currentRowN }) {

    const [displayMode, setdisplayMode] = useState('write');

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <FormLabel>{columnNames[fieldN]}</FormLabel>
            <ToggleButtonGroup
                exclusive
                aria-label="Platform"
                size="small"
                value={displayMode}
                onChange={(event, newDisplayMode) => {
                    if (newDisplayMode !== null) {
                        setdisplayMode(newDisplayMode);
                    }
                }}
            >
                <ToggleButton value="write"><CreateIcon /></ToggleButton>
                <ToggleButton value="preview"><RemoveRedEyeIcon /></ToggleButton>
            </ToggleButtonGroup>

            <Box sx={{ maxHeight: "20vh", overflowY: "auto", border: "1px solid grey" }}>
                {displayMode === 'write' ? (
                    <FormControl fullWidth margin="normal" >
                        <TextareaAutosize
                            name={columnNames[fieldN]}
                            value={value}
                            onChange={onChangeNote}
                            minRows={4}
                            style={{
                                border: 'none',
                                outline: 'none',
                            }}
                            disabled={mode === "edit" && ingredient[currentRowN] && ingredient[currentRowN].length === 1}
                            
                        />
                    </FormControl>
                ) : (
                    <Markdown fullWidth margin="normal">
                        {value}
                    </Markdown>
                )}
            </Box>

        </Box>
    )

}

export default MarkdownField;