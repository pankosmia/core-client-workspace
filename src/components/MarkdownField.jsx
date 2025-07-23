import { useState } from "react";
import Markdown from 'react-markdown';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import CreateIcon from '@mui/icons-material/Create';
import { Box, ToggleButton, ToggleButtonGroup, FormControl, TextField } from "@mui/material";

function MarkdownField({ columnNames, onChangeNote, value, fieldN, ingredient, currentRowN,mode }) {
    const [displayMode, setdisplayMode] = useState('write');

    return (
        <Box>
            <ToggleButtonGroup
                exclusive
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

            {displayMode === 'write' ? (
                <FormControl fullWidth margin="normal" >
                    <TextField
                        label={columnNames[fieldN]}
                        value={value}
                        onChange={onChangeNote}
                        minRows={5}
                        maxRows={5}
                        fullWidth
                        multiline
                        size="small"
                        variant="outlined"
                        disabled={mode === "edit" && ingredient[currentRowN] && ingredient[currentRowN].length === 1}
                    />
                </FormControl>
            ) : (
                <Box sx={{ border: "1px solid", marginTop: 2 }}>
                    <Markdown fullWidth>
                        {value}
                    </Markdown>
                </Box>
            )}
        </Box>
    )

}

export default MarkdownField;