import Markdown from 'react-markdown';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import CreateIcon from '@mui/icons-material/Create';
import { Box, TextField, Button, ToggleButton, ToggleButtonGroup, CardContent, TextareaAutosize, List, ListItemButton, ListItemIcon, ListItemText, Collapse, FormControl, FormLabel } from "@mui/material";

const [stateButtonNote, setStateButtonNote] = useState('write');

    // Permet une modification des notes ou de la reference
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "note") {
            setCurrentNote(value);
            setContentChanged(true);
        } else if (name === "reference") {
            setCurrentReference(value);
            setContentChanged(true);
        }
    };


function editorNote() {

        <Box sx={{ padding: 2 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <FormLabel>Note</FormLabel>
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

            {stateButtonNote === 'write' ? (
                <FormControl fullWidth margin="normal">
                    <TextareaAutosize
                        minRows={4}
                        name="note"
                        value={currentNote}
                        onChange={handleChange}
                        className="text-aera"

                    />
                </FormControl>
            ) : (
                <Markdown>{
                    currentNote.length > 0
                        ? currentNote
                        : "No notes found for this verse"}
                </Markdown>
            )}
            <Button onClick={handleSave} variant="contained" sx={{ mt: 2 }}>Modifier</Button>
        </Box>
}

export default editorNote();