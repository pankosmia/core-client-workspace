import { useState } from "react";
import Markdown from 'react-markdown';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import CreateIcon from '@mui/icons-material/Create';
import { Box, ToggleButton, ToggleButtonGroup, TextareaAutosize, FormControl, FormLabel } from "@mui/material";

function MarkdownField({ currentRow, columnNames, onChangeNote, value }) {

    const [stateButtonNote, setStateButtonNote] = useState('write');
    const [displayMode, setdisplayMode] = useState('');
    return (
        <Box sx={{ border: "2px" }}>
            <FormLabel>Note </FormLabel>
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
                <ToggleButton displayMode='write' onClick={() => setStateButtonNote('write')}><CreateIcon /></ToggleButton>
                <ToggleButton displayMode='preview' onClick={() => setStateButtonNote('preview')}><RemoveRedEyeIcon /></ToggleButton>
            </ToggleButtonGroup>
            {columnNames
                .filter((column) => column === "Note")
                .map((column) => {
                    const noteIndex = columnNames.indexOf("Note");
                    return (
                        <>
                            {stateButtonNote === 'write' ? (
                                <FormControl fullWidth margin="normal">
                                    <TextareaAutosize
                                        name={column}
                                        value={value}
                                        onChange={onChangeNote}
                                        minRows={4}

                                    />
                                </FormControl>
                            ) : (
                                <Markdown>
                                    {value}
                                </Markdown>
                            )}

                        </>
                    );
                })}

        </Box>
    )

}

export default MarkdownField;