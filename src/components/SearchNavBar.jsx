import { useEffect, useState, useContext } from "react";
import { Box, ToggleButton,ToggleButtonGroup} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';

function SearchNavBar() {
    const [value, setValue] = useState('');
    const [contentChanged, _setContentChanged] = useState(false);

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
