import { useState } from "react";
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Collapse, TextField, FormControl } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material"
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

function SearchWithVerses({ systemBcv, ingredient, setCurrentRowN, setSaveIngredientValue }) {

    const [currentChapter, setCurrentChapter] = useState('');
    const [currentVerse, setCurrentVerse] = useState();
    const [open, setOpen] = useState(false);
    const columnNames = ingredient[0] || [];
    const [rowData, setRowData] = useState(Array(7).fill("", 0, 7))

    // Permet d'afficher tous les versets selon un chapitre selectionné
    const bookCode = Array.from(
        new Set(ingredient.map(l => l[0].split(':')[0]))
    );

    const verses = currentChapter
        ? ingredient.filter(l => l[0].startsWith(`${currentChapter}:`))
        : [];

    const handleClick = () => {
        setOpen(!open);
    };
    const handleChangeId = (id) => {
        const index = ingredient.findIndex(l => l[1] === id);
        if (index !== -1) {
            setCurrentVerse(ingredient[index][1]);
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
                                    //selected={chap === currentChapter}
                                    onClick={() => {
                                        setCurrentChapter(chap);
                                        setCurrentVerse(null);
                                        setSaveIngredientValue(true)
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
                                                    selected={v[1] === currentVerse}
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

        // <Box>
        //     {columnNames.filter((column) => column === "Reference")
        //         .map((column, n) => {
        //             return (
        //                 <>
        //                     <FormControl fullWidth margin="normal" key={n}>
        //                         <TextField
        //                             label={column}
        //                             value={rowData[n]}
        //                             minRows={4}
        //                             style={{ border: "1px solid grey", borderRadius: "1px" }}
        //                         />
        //                     </FormControl>

        //                 </>
        //             );
        //         })}
        // </Box>

    );
}

export default SearchWithVerses;
