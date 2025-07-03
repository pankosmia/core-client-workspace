import { useState } from "react";
import { Box, List, ListItemButton, ListItemText, Collapse  } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material"

function SearchWithVerses({ ingredient, setCurrentRowN, setIngredientValueChanged }) {

    const [currentChapter, setCurrentChapter] = useState('');
    const [currentVerse, setCurrentVerse] = useState();
    const [openChapter, setOpenChapter] = useState(false)

    // Permet d'afficher tous les versets 
    const bookCode = Array.from(
        new Set(ingredient.map(l => l[0].split(':')[0]))
    );

    const verses = currentChapter
        ? ingredient.filter(l => l[0].startsWith(`${currentChapter}:`))
        : [];


    const handleClick = () => {
        setOpenChapter(!openChapter);
    };

    const handleChangeId = (id) => {
        const index = ingredient.findIndex(l => l[1] === id);
        if (index !== -1) {
            setCurrentVerse(ingredient[index][1]);
            setCurrentRowN(index);
        }
    };

    return (
            <List sx={{maxHeight:"70vh",overflowY:"auto"}}>
                {bookCode.map(chap => (
                    <>
                        <ListItemButton
                            key={chap}
                            onClick={() => {
                                setCurrentChapter(chap);
                                setCurrentVerse(null);
                                setIngredientValueChanged(true);
                                handleClick()
                            }}
                        >
                            <ListItemText primary={`Chap ${chap}`} />
                            {openChapter ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>

                        <Collapse in={openChapter} timeout="auto" unmountOnExit>
                            {chap === currentChapter && (
                                <List>
                                    {verses.map(v => (
                                        <ListItemButton
                                            key={v[0]}
                                            selected={v[1] === currentVerse}
                                            onClick={() => handleChangeId(v[1])}
                                        >
                                            <ListItemText primary={`v ${v[0].split(':')[1]} - ${v[1]}`} />
                                        </ListItemButton>
                                    ))}

                                </List>
                            )}
                        </Collapse>
                    </>
                ))}
            </List>
    );
}

export default SearchWithVerses;
