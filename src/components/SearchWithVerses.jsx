import { useState } from "react";
import { List, ListItemButton, ListItemText, Collapse, Typography } from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess"
import ExpandMore from "@mui/icons-material/ExpandMore"

function SearchWithVerses({ ingredient, setCurrentRowN, setIngredientValueChanged, ingredientValueChanged, currentRowN, updateBcv }) {

    const [currentChapter, setCurrentChapter] = useState('');
    const [openChapter, setOpenChapter] = useState(false)

    // Permet d'afficher tous les versets 
    const bookCode = [...new Set(ingredient.map(l => l[0].split(':')[0]))];

    const verses = currentChapter
        ? ingredient.filter(l => l[0].startsWith(`${currentChapter}:`))
        : [];


    const handleClick = () => {
        setOpenChapter(!openChapter);
    };

    const handleChangeId = (id) => {
        const index = ingredient.findIndex(l => l[1] === id);
        if (index !== -1) {
            setCurrentRowN(index);
            updateBcv(index);
        }
    };

    return (
        <List sx={{ maxHeight: "70vh", overflowY: "auto" }}>
            {bookCode.map(chap => (
                <>
                    <ListItemButton
                        disabled={!ingredientValueChanged}
                        key={chap}
                        onClick={() => {

                            setCurrentChapter(chap);
                            setIngredientValueChanged(true);
                            handleClick();
                        }}
                    >
                        <ListItemText primary={<Typography sx={{ fontWeight: currentChapter === chap ? "bold" : "normal" }}>{`${/^\d+$/.test(chap) ? `Chap ${chap}` : chap}`}</Typography>} />
                        {openChapter && currentChapter === chap ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>

                    <Collapse in={openChapter} timeout="auto" unmountOnExit>
                        {chap === currentChapter && (
                            <List component="div">
                                {verses
                                    .map(v => (
                                        <ListItemButton
                                            disabled={!ingredientValueChanged}
                                            key={v[1]}
                                            onClick={() => { handleChangeId(v[1]); setIngredientValueChanged(true) }}
                                        >
                                            <ListItemText primary={<Typography sx={{ fontWeight: ingredient[currentRowN][1] === v[1] ? "bold" : "normal" }}>{/^\d+$/.test(v[0].split(':')[1])
                                                ? `v${v[0].split(':')[1]} - ${v[1]}`
                                                : `${v[0].split(':')[1]} - ${v[1]}`}</Typography>} sx={{ pl: 4 }} />
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
