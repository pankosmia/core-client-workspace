import {
    Button,
    InputAdornment,
    Menu,
    MenuItem,
    TextField,
    Tooltip
} from "@mui/material";
import { doI18n, postEmptyJson} from "pithekos-lib";
import {i18nContext, debugContext} from "pankosmia-rcl"
import SearchIcon from '@mui/icons-material/Search';
import {useContext, useState} from "react";

function JumpButton({planIngredient, selectedStory, setSelectedStory, anchorEl, setAnchorEl, open}) {
    const {i18nRef} = useContext(i18nContext);
    const {debugRef} = useContext(debugContext);
    const ITEM_HEIGHT = 48;

    const [search, setSearch] = useState("");

    const filteredStories = planIngredient.sections.filter(
        c => {
            const label = `${c.fieldInitialValues.reference} ${c.fieldInitialValues.sectionTitle}`
                .toLowerCase();

            return label.includes(search.toLowerCase());
        }
    );

    const updateBcv = (b, c, v) => {
        postEmptyJson(
            `/navigation/bcv/${b}/${c}/${v}`,
            debugRef.current
        );
    }

    return <>
        <Button
            id="fade-button"
            aria-controls={open ? 'fade-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={(event) => setAnchorEl(event.currentTarget)}
        >
            {doI18n(`pages:core-local-workspace:jump_to_story`, i18nRef.current)}
        </Button>
        <Menu
            id="fade-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={() => setAnchorEl(null)}
            slotProps={{
                paper: {
                    style: {
                        maxHeight: ITEM_HEIGHT * 4.5,
                        width: 'auto',
                        overflow: "auto"
                    },
                },
                list: {
                    'aria-labelledby': 'fab-menu',
                },
            }}
        >
            <MenuItem>
                <TextField
                    placeholder="Search ..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    size="small"
                    fullWidth
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon/>
                                </InputAdornment>
                            )
                        }
                    }}
                />
            </MenuItem>
            {filteredStories.length === 0 ? (
                <MenuItem disabled>
                    {`${doI18n("pages:core-local-workspace:no_result", i18nRef.current, debugRef.current)}`}
                </MenuItem>
            ) : (
                filteredStories.map(
                    (c, i) => (
                        <Tooltip key={i} title={c.fieldInitialValues.reference}>
                            <MenuItem
                                onClick={
                                    () => {
                                        setSelectedStory(c.fieldInitialValues.sectionNumber);
                                        setAnchorEl(null);
                                        updateBcv(
                                            c.bookCode,
                                            c.cv[0].split(":")[0],
                                            c.cv[0].split(":")[1]
                                        );
                                    }
                                }
                                value={c.fieldInitialValues.sectionNumber}
                                selected={selectedStory === c.fieldInitialValues.sectionNumber}
                            >
                                {c.fieldInitialValues.sectionNumber} - {c.fieldInitialValues.sectionTitle}
                            </MenuItem>
                        </Tooltip>
                    )
                )
            )
            }
        </Menu>
    </>
}

export default JumpButton;