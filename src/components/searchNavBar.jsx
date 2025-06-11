import { useEffect, useState, useContext } from "react";
import { Box, Paper, TextField, Button, ToggleButton, Pagination, ToggleButtonGroup, CardContent, ListSubheader, TextareaAutosize, List, ListItemButton, ListItemIcon, ListItemText, Collapse, FormControl, FormLabel } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material"
import Markdown from 'react-markdown';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import CreateIcon from '@mui/icons-material/Create';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import SearchIcon from '@mui/icons-material/Search';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import {
    i18nContext as I18nContext,
    debugContext as DebugContext,
    bcvContext as BcvContext,
    doI18n,
    getText
} from "pithekos-lib";


function SearchNavBar({ metadata }) {
    const [ingredient, setIngredient] = useState([]);
    const { systemBcv, setSystemBcv } = useContext(BcvContext);
    const { debugRef } = useContext(DebugContext);
    const { i18nRef } = useContext(I18nContext);
    const [open, setOpen] = useState(false);
    const [currentRow, setCurrentRow] = useState('');
    const [currentNote, setCurrentNote] = useState('');
    const [currentReference, setCurrentReference] = useState('');
    const [currentTags, setCurrentTags] = useState('');
    const [currentSupportReference, setCurrentSupportReference] = useState('');
    const [currentQuote, setCurrentQuote] = useState('');
    const [currentOccurrence, setCurrentOccurrence] = useState('');
    const [value, setValue] = useState('');
    const [contentChanged, _setContentChanged] = useState(false);
    const [page, setPage] = useState(4)

    const getAllData = async () => {
        const ingredientLink = `/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.tsv`;
        let response = await getText(ingredientLink, debugRef.current);
        if (response.ok) {
            setIngredient(
                response.text
                    .split("\n")
                    .map(l => l.split("\t").map(f => f.replace(/\\n/g, "\n\n")))
            );
        } else {
            setIngredient([])
        }
    };
    useEffect(
        () => {
            getAllData().then();
        },
        [systemBcv]
    );

    const Search = styled('div')(({ theme }) => ({
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: alpha(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.25),
        },
        marginRight: theme.spacing(2),
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(3),
            width: 'auto',
        },
    }));

    const SearchIconWrapper = styled('div')(({ theme }) => ({
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }));

    const StyledInputBase = styled(InputBase)(({ theme }) => ({
        color: 'inherit',
        '& .MuiInputBase-input': {
            padding: theme.spacing(1, 1, 1, 0),
            paddingLeft: `calc(1em + ${theme.spacing(4)})`,
            transition: theme.transitions.create('width'),
            width: '100%',
            [theme.breakpoints.up('md')]: {
                width: '20ch',
            },
        },
    }));

    return (

        <Box display="flex"
            justifyContent="center"
            alignItems="center"
            width="100%"
            gap={2}
            padding={2}>
            <Search>
                <SearchIconWrapper>
                    <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                    placeholder="Search notes ...."
                    inputProps={{ 'aria-label': 'search' }}
                    border="#FFF"
                />
            </Search>
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
                <ToggleButton value="book">Book</ToggleButton>
                <ToggleButton value="chapter">Chapter</ToggleButton>
            </ToggleButtonGroup>
           
        </Box>

    );
}

export default SearchNavBar;
