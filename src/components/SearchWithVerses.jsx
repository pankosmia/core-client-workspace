import { useState } from "react";
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Collapse } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material"
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

function SearchWithVerses({ systemBcv, ingredient, setCurrentRowN }) {

    const [currentChapter, setCurrentChapter] = useState('');
    const [currentVerse, setCurrentVerse] = useState();
    const [open, setOpen] = useState(false);

    // Permet d'afficher tous les versets selon un chapitre selectionné
    const bookCode = [systemBcv.chapterNum]
    const verses = currentChapter
        ? ingredient.filter(l => l[0].startsWith(`${currentChapter}:`))
        : [];

    const handleClick = () => {
        setOpen(!open);
    };
    const handleChangeId = (id) => {
        const index = ingredient.findIndex(l => l[1] === id);
        if (index !== -1) {
            setCurrentVerse(ingredient[index][0]);
            setCurrentRowN(index);
        }
    };
    return (

        <Box>
            <List>
                <ListItemButton onClick={handleClick}>
                    <ListItemIcon>
                        <AutoStoriesIcon />
                    </ListItemIcon>
                    <ListItemText primary="Chapter" />
                    {open ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>

                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List>
                        {bookCode.map(chap => (
                            <>
                                <ListItemButton
                                    key={chap}
                                    selected={chap === currentChapter}
                                    onClick={() => {
                                        setCurrentChapter(chap);
                                        setCurrentVerse(null);
                                    }}
                                >
                                    <ListItemText primary={`Chap ${chap}`} />
                                </ListItemButton>

                                {chap === currentChapter && (
                                    <Collapse in timeout="auto" unmountOnExit>
                                        <List>
                                            {verses.map(v => (
                                                <ListItemButton
                                                    key={v[0]}
                                                    selected={v[0] === currentVerse}
                                                    onClick={() => handleChangeId(v[1])}
                                                >
                                                    <ListItemText primary={`v ${v[0].split(':')[1]} - ${v[1]}`} />
                                                </ListItemButton>
                                            ))}

                                        </List>
                                    </Collapse>
                                )}
                            </>
                        ))}
                    </List>
                </Collapse>
            </List>
        </Box>

    );
}

export default SearchWithVerses;
