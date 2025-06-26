import { useState } from "react";
import Markdown from 'react-markdown';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import CreateIcon from '@mui/icons-material/Create';
import { Box, ToggleButton, ToggleButtonGroup, TextareaAutosize, FormControl, FormLabel } from "@mui/material";

function MarkdownField({ currentRow, columnNames, onChangeNote, addCurrentRow, valeur }) {

    const [stateButtonNote, setStateButtonNote] = useState('write');
    const [value, setValue] = useState('');
    return (
        <Box sx={{ border: "2px" }}>
            <FormLabel>Note </FormLabel>
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
            {columnNames
                .filter((column) => column === "Note")
                .map((column) => {
                    const noteIndex = columnNames.indexOf("Note");
                    return (
                        <>
                            {stateButtonNote === 'write' ? (
                                <FormControl fullWidth margin="normal">
                                    {valeur === "" ? (
                                        <TextareaAutosize
                                            name={column}
                                            value={addCurrentRow.content[noteIndex]|| ""}
                                            onChange={onChangeNote}
                                            minRows={4}
                                           
                                        />
                                    ) : (
                                        <TextareaAutosize
                                            name={column}
                                            value={currentRow.content[noteIndex]}
                                            onChange={onChangeNote}
                                            minRows={4}
                                        />
                                    )}
                                </FormControl>
                            ) : valeur === "" ? (
                                <Markdown>
                                    {/* {//addCurrentRow.content[noteIndex]?.length > 0
                                        ? //addCurrentRow.content[noteIndex]
                                        : "Aucune note ajoutée pour ce verset."} */}
                                    {"Aucune note ajoutée pour ce verset."}
                                </Markdown>
                            ) : (
                                <Markdown>
                                    {currentRow.content[noteIndex]?.length > 0
                                        ? currentRow.content[noteIndex]
                                        : "Aucune note disponible pour ce verset."}
                                </Markdown>
                            )}

                        </>
                    );
                })}

        </Box>
    )

}

export default MarkdownField;