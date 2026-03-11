import { useEffect } from 'react';
import {  ListItemButton, ListItemText, Typography, Box, Stack } from "@mui/material";
import AddFab from "./AddFab";

function SearchWithVerses({ ingredient, setIngredient, setCurrentRowN, currentRowN,cellValueChanged, setCellValueChanged, updateBcv, currentChapter }) {

    const verses = currentChapter
    ? ingredient
        .filter(l => l[0].startsWith(`${currentChapter}:`))
        .filter((item, index, self) => 
            // Verse ranges only appear in the first of the 2 verses
            index === self.findIndex((t) => t[1] === item[1])
        )
        .sort((a, b) => {
            // Extract the first number after the two dots
            const getStartVerse = (str) => parseInt(str.split(':')[1].split('-')[0]);
            return getStartVerse(a[0]) - getStartVerse(b[0]);
        })
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
                                    {`${currentChapter}:${v[0].split(':')[1]}`}
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
