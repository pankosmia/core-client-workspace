import { useEffect, useState, useContext } from "react";
import Markdown from 'react-markdown';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import CreateIcon from '@mui/icons-material/Create';
import { Box, TextField, Button, ToggleButton, ToggleButtonGroup, CardContent, TextareaAutosize, List, ListItemButton, ListItemIcon, ListItemText, Collapse, FormControl, FormLabel } from "@mui/material";

// Permet une modification des notes ou de la reference
function EditorNote({ currentRow, columnNames }) {
    //   const [contentChanged, _setContentChanged] = useState(false);
    const [stateButtonNote, setStateButtonNote] = useState('write');
    const [value, setValue] = useState('');
    console.log(currentRow)

    return (
        <Box sx={{ padding: 2 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <ToggleButtonGroup
                    exclusive
                    aria-label="Platform"
                    size="small"
                    value={value}
                    onChange={(event, newValue) => {
                        if (newValue !== null) {
                            setValue(newValue);
                        }
                    }}
                >
                    <ToggleButton value='write' onClick={() => setStateButtonNote('write')}><CreateIcon /></ToggleButton>
                    <ToggleButton value='preview' onClick={() => setStateButtonNote('preview')}><RemoveRedEyeIcon /></ToggleButton>
                </ToggleButtonGroup>
            </div>
            {columnNames
                .filter((column) => column === "Note")
                .map((column, n) => (
                    <>
                        {stateButtonNote === 'write' ? (
                            <FormControl fullWidth margin="normal"  key={n}>
                                <TextareaAutosize
                                    minRows={4}
                                    name={column}
                                    value={currentRow.content[n] || ''}
                                    className="text-aera"
                                // onChange={handleChange}
                                />
                            </FormControl>
                          
                        ) : (
                            <Markdown>
                                {currentRow.content[n].length > 0
                                    ? currentRow.content[n]
                                    : "No notes found for this verse"}
                            </Markdown>
                        )}
                    </>
                ))}
            {/* <Button onClick={nextRow} variant="contained" sx={{ mt: 2 }}>Enregistrer</Button> */}
        </Box>
    )

}

export default EditorNote;