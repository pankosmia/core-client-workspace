import { useEffect } from 'react';
import {  ListItemButton, ListItemText, Typography, Box, Stack } from "@mui/material";
import AddFab from "./AddFab";

function SearchWithVerses({ ingredient, setIngredient, setCurrentRowN, currentRowN,cellValueChanged, setCellValueChanged, updateBcv, currentChapter }) {

    const verses = currentChapter
        ? ingredient.filter(l => l[0].startsWith(`${currentChapter}:`))
        : [];

    const handleChangeId = (id) => {
        const index = ingredient.findIndex(l => l[1] === id);
        console.log(index);
        if (index !== -1) {
            setCurrentRowN(index);
            updateBcv(index);
        }
    };

    useEffect(() => {
        if (verses.length > 0) {
            const firstVerseId = verses[0][1];
            handleChangeId(firstVerseId);
        }
    }, [currentChapter]);

    return (
        <Stack spacing={2}>
            <AddFab
                currentRowN={currentRowN}
                setCurrentRowN={setCurrentRowN}
                ingredient={ingredient}
                setIngredient={setIngredient}
                cellValueChanged={cellValueChanged}
                setCellValueChanged={setCellValueChanged}
            />
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
        </Stack>
    );
}

export default SearchWithVerses;
