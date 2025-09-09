import {useState, useContext} from "react";
import "./TextTranslationEditorMuncher.css";
import {
    i18nContext as I18nContext,
    doI18n
} from "pithekos-lib";
import DraftingEditor from "./DraftingEditor";
import {Box, Chip, FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import SharedEditor from "./SharedEditor";

function TextTranslationEditorMuncher({metadata}) {
    const {i18nRef} = useContext(I18nContext);
    const [editor, setEditor] = useState("units");
    const pageOptions = [
        {value: 'units', label: 'Units of meaning'},
        {value: 'chapter', label: 'Chapter'},
    ];
    const handleChange = (event) => {
        setEditor(event.target.value);
    };

    return (
        <Box sx={{p: 2}}>
            <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                <FormControl>
                    <InputLabel id="page-selector-label">
                        {doI18n("pages:core-local-workspace:editor_mode", i18nRef.current)}
                    </InputLabel>
                    <Select
                        labelId="page-selector-label"
                        value={editor}
                        onChange={handleChange}
                        label={doI18n("pages:core-local-workspace:editor_mode", i18nRef.current)}
                        renderValue={(selected) => (
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                <Chip
                                    label={pageOptions.find((opt) => opt.value === selected)?.label}
                                />
                            </Box>
                        )}
                        sx={{borderRadius: "28px"}}
                    >
                        {pageOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
            <Box>
                {editor === 'chapter' ? <SharedEditor  metadata={metadata}/>: <DraftingEditor metadata={metadata}/>}
            </Box>
        </Box>
    );
}

export default TextTranslationEditorMuncher;