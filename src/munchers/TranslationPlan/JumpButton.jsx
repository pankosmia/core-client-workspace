import {
    Button,
    InputAdornment,
    Menu,
    MenuItem,
    TextField,
    Tooltip
} from "@mui/material";
import { doI18n, postEmptyJson } from "pithekos-lib";
import { i18nContext, debugContext } from "pankosmia-rcl"
import SearchIcon from '@mui/icons-material/Search';
import { useContext, useState } from "react";

function JumpButton({ planIngredient, selectedSection, setSelectedSection, anchorEl, setAnchorEl, open }) {
    const { i18nRef } = useContext(i18nContext);
    const { debugRef } = useContext(debugContext);
    const ITEM_HEIGHT = 48;

    const [search, setSearch] = useState("");

    const filteredStories = planIngredient.sections.filter(
        c => {
            const label = c.fieldInitialValues?.reference ? `${c.fieldInitialValues.reference} ${c.fieldInitialValues.sectionTitle}`
                .toLowerCase() : `${c.bookCode} ${c.cv}`.toLowerCase()

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
                                    <SearchIcon />
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
                    (c, i) => {
                        const verses = c.cv[1].includes('-')
                            ? `${c.cv[0]} - ${c.cv[1].split("-")[1]}`
                            : `${c.cv[0]} - ${c.cv[1].split(":")[1]}`;
                        return (
                            <Tooltip key={i} title={c.fieldInitialValues.reference || `${c.bookCode} ${c.cv}`}>
                                <MenuItem
                                    onClick={
                                        () => {
                                            setSelectedSection(c.fieldInitialValues.sectionNumber || `${c.bookCode} ${c.cv[0]}`);
                                            setAnchorEl(null);
                                            updateBcv(
                                                c.bookCode,
                                                c.cv[0].split(":")[0],
                                                c.cv[0].split(":")[1]
                                            );
                                        }
                                    }
                                    value={c.fieldInitialValues.sectionNumber || `${c.bookCode} ${c.cv[0]}` || null}
                                    selected={c.fieldInitialValues?.sectionNumber != null
                                        ? selectedSection === c.fieldInitialValues.sectionNumber
                                        : selectedSection === `${c.bookCode} ${c.cv[0]}`}
                                >
                                    {c.fieldInitialValues?.sectionNumber ? `${c.fieldInitialValues.sectionNumber} - ${c.fieldInitialValues.sectionTitle}` : `${c.bookCode} ${verses}`}
                                </MenuItem>
                            </Tooltip>
                        )

                    }

                )
            )
            }
        </Menu>
    </>
}

export default JumpButton;