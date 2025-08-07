import { useState } from "react";
import { List, ListItemButton, ListItemText, Collapse, Typography, ListItem, IconButton } from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess"
import ExpandMore from "@mui/icons-material/ExpandMore"
import DeleteNote from "./DeleteNote";
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
function SearchWithVerses({ ingredient,setIngredient, setCurrentRowN, currentRowN, updateBcv,currentRow }) {

    const [currentChapter, setCurrentChapter] = useState('');
    const [openChapter, setOpenChapter] = useState(false)
    const [openedModalDelete, setOpenedModalDelete] = useState(false);

    // Permet d'ouvrir la modal Delete
    const handleOpenModalDelete = () => {
        setOpenedModalDelete(true);
    };

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
        <List sx={{ maxHeight: "70vh", overflowY: "auto", width: "50vh" }}>
            {bookCode.splice(1).filter(chap => chap && chap.trim() !== "").map(chap => (
                <>
                    <ListItemButton
                        key={chap}
                        onClick={() => {

                            setCurrentChapter(chap);
                            handleClick();
                        }}
                    >
                        <ListItemText primary={<Typography sx={{ fontWeight: currentChapter === chap ? "bold" : "normal" }}>{`${/^\d+$/.test(chap) ? `Ch ${chap}` : chap}`}</Typography>} />
                        {openChapter && currentChapter === chap ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>

                    <Collapse in={openChapter} timeout="auto" unmountOnExit>
                        {chap === currentChapter && (
                            <List component="div">
                                {verses
                                    .map(v => (
                                        <ListItem
                                            key={v[1]}
                                            onClick={() => { handleChangeId(v[1]) }}
                                            secondaryAction={
                                                <IconButton
                                                    onClick={() => handleOpenModalDelete()}
                                                    sx={{
                                                        "&.Mui-disabled": {
                                                            color: '#bebbbbff'
                                                        }
                                                    }}
                                                    disabled={ingredient[currentRowN] && ingredient[currentRowN].length === 1}
                                                >
                                                    <DeleteOutlinedIcon size="large" color={ingredient[currentRowN] && ingredient[currentRowN].length === 1 ? "#eaeaea" : "primary"} />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemText primary={<Typography sx={{ fontWeight: ingredient[currentRowN][1] === v[1] ? "bold" : "normal" }}>{/^\d+$/.test(v[0].split(':')[1])
                                                ? `v${v[0].split(':')[1]} - ${v[1]}`
                                                : `${v[0].split(':')[1]} - ${v[1]}`}</Typography>} sx={{ pl: 4 }} />
                                        </ListItem>
                                    ))}

                            </List>
                        )}
                    </Collapse>
                </>
            ))}
            <DeleteNote
                mode="delete"
                open={openedModalDelete}
                closeModal={() => setOpenedModalDelete(false)}
                ingredient={ingredient}
                setIngredient={setIngredient}
                rowData={currentRow}
                currentRowN={currentRowN}
            />
        </List>

    );
}

export default SearchWithVerses;
