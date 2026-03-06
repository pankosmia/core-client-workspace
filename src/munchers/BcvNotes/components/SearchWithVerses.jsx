import { useState } from "react";
import { List, ListItem, ListItemButton, ListItemText, Typography, Box, TextField, MenuItem, IconButton } from "@mui/material";
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

function SearchWithVerses({ ingredient, setCurrentRowN, currentRowN, updateBcv }) {


    // Permet d'afficher tous les versets 
    const bookCode = [...new Set(ingredient.map(l => l[0].split(':')[0]))];
    const chapters = bookCode.slice(1).filter(chap => chap && chap.trim() !== "").sort((a, b) => parseInt(a) - parseInt(b));
    const [currentChapter, setCurrentChapter] = useState('1');

    const verses = currentChapter
        ? ingredient.filter(l => l[0].startsWith(`${currentChapter}:`))
        : [];

    const handleChangeId = (id) => {
        const index = ingredient.findIndex(l => l[1] === id);
        if (index !== -1) {
            setCurrentRowN(index);
            updateBcv(index);
        }
    };

    const currentIndex = chapters.indexOf(currentChapter);

    const previousChapter = () => {
        if (currentIndex > 0) {
            setCurrentChapter(chapters[currentIndex - 1]);
        }
    };

    const nextChapter = () => {
        if (currentIndex < chapters.length - 1) {
            setCurrentChapter(chapters[currentIndex + 1]);
        }
    };

    return (
        <List sx={{ width: "15rem" }}>
            <ListItem>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, width: "100%" }}>
                <IconButton 
                    size="small" 
                    onClick={previousChapter}
                    disabled={currentIndex <= 0}
                >
                    <KeyboardArrowLeftIcon />
                </IconButton>
                <TextField
                    select
                    label="Ch"
                    size="small"
                    fullWidth
                    value={currentChapter}
                    onChange={(e) => setCurrentChapter(e.target.value)}
                >
                    {chapters.map((chap) => (
                        <MenuItem key={chap} value={chap}>
                            {chap}
                        </MenuItem>
                    ))}
                </TextField>
                <IconButton 
                    size="small" 
                    onClick={nextChapter}
                    disabled={currentIndex >= chapters.length - 1}
                >
                    <KeyboardArrowRightIcon />
                </IconButton>
                </Box>
            </ListItem>
            <Box sx={{ maxHeight: "75vh", overflowY: "auto" }}>
                {verses.map((v) => (
                <ListItemButton key={v[1]} onClick={() => handleChangeId(v[1])}>
                    <ListItemText 
                        primary={
                            <Typography sx={{ fontWeight: ingredient[currentRowN][1] === v[1] ? "bold" : "normal" }}>
                            {`v${v[0].split(':')[1]} - ${v[1]}`}
                            </Typography>
                        } 
                        sx={{ pl: 4 }} 
                    />
                </ListItemButton>
                ))}
            </Box>
        </List>
    );
}

export default SearchWithVerses;
