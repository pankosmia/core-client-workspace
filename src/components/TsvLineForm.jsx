import { Box, FormControl, TextField, Button, IconButton } from "@mui/material";
import MarkdownField from "./MarkdownField";
import { useState, useContext, useEffect } from "react";
import {
    i18nContext as I18nContext,
    doI18n,
} from "pithekos-lib";
import DeleteIcon from '@mui/icons-material/Delete';
import { v4 as uuidv4 } from 'uuid';
import DeleteNote from "./DeleteNote";
import ButtonsNavigation from "./ButtonsNavigation";
import md5 from "md5";

function TsvLineForm({ mode, currentRow, ingredient, setIngredient, saveFunction, currentRowN, setCurrentRowN, setSaveIngredientTsv, updateBcv }) {
    const { i18nRef } = useContext(I18nContext);
    const [rowData, setRowData] = useState(Array(7).fill("", 0, 7))
    const [cellValueChanged, setCellValueChanged] = useState(false);
    const [openedModalDelete, setOpenedModalDelete] = useState(false);
    const [md5Ingredient, setMd5Ingredient] = useState("");
    const columnNames = ingredient[0] || [];

    useEffect(
        () => {
            if (mode === "edit" && ingredient.length > 0) {
                setRowData(currentRow);
            } else {
                const newRowData = [...rowData]
                newRowData[1] = generateId()
                setRowData(newRowData)
            }
        },
        [ingredient, currentRow, mode]
    );
    // Permet d'ouvrir la modal Delete
    const handleOpenModalDelete = () => {
        setOpenedModalDelete("delete");
    };
    // Permet la modification d'une note
    const changeCell = (event, n) => {
        const newCellValue = event.target.value;
        const newRowData = [...rowData];
        newRowData[n] = newCellValue;
        if (newRowData[0].length > 0 && /^[^:]+:[^:]+$/.test(newRowData[0])) {
            setCellValueChanged(true)
        } else {
            setCellValueChanged(false)
        }
        setRowData(newRowData);
    };

    // Permet d'annuler les modications faites sur la note 
    const handleCancel = () => {
        const newRowData = (mode === "edit" ? [...currentRow] : Array(7).fill("", 0, 7))
        setRowData(newRowData);
    };

    // useEffect(() => {
    //     const hash = md5(JSON.stringify(ingredient, null, 2));
    //     setMd5Ingredient(hash);
    //     console.log("Hash initial :", hash);
    // }, []);

    const generateId = () => {
        let existingId = ingredient.map(l => l[1]);
        let myId = null;
        let found = false;
        while (!found) {
            myId = uuidv4().substring(0, 4)
            if (!existingId.includes(myId)) {
                found = true
            }
        }
        return myId
    }

    return (
        <Box sx={{ padding: 1, justifyContent: "center", height: "50%" }}>
            {columnNames.map((column, n) => (
                <FormControl fullWidth margin="normal" key={n} >
                    {['Note', 'Question', 'Response'].includes(column) ? (
                        <MarkdownField
                            value={rowData[n]}
                            columnNames={columnNames}
                            onChangeNote={(e) => changeCell(e, n)}
                            mode={mode}
                            fieldN={n}

                        />
                    ) : (
                        <TextField
                            label={column}
                            value={rowData[n]}
                            placeholder={n === 0 ? "1:1" : ""}
                            required={n === 0}
                            disabled={n === 1}
                            variant="outlined"
                            fullWidth
                            size="small"
                            onChange={(e) => changeCell(e, n)}
                        />
                    )}
                </FormControl>

            ))}
            <Box sx={{ display: 'flex', gap: 2, padding: 1, justifyContent: "center" }}>
                {mode === "add" && (<Button
                    onClick={() => { saveFunction(currentRowN, rowData); setCellValueChanged(false) }}
                    variant="contained"
                    disabled={!cellValueChanged}
                    sx={{
                        mt: 2,
                        "&.Mui-disabled": {
                            background: "#eaeaea",
                            color: "#424242"
                        }
                    }}
                >
                    {`${doI18n("pages:core-local-workspace:save_note", i18nRef.current)}`}
                </Button>)}

                {mode === "edit" && (
                    <>

                        <Button
                            onClick={() => {
                                handleCancel();
                                setCellValueChanged(false);
                              
                            }}
                            variant="contained"
                            disabled={!cellValueChanged}
                            sx={{
                                mt: 2,
                                "&.Mui-disabled": {
                                    background: "#eaeaea",
                                    color: "#424242"
                                }
                            }}
                        >
                            {doI18n("pages:core-local-workspace:cancel", i18nRef.current)}
                        </Button>

                        <ButtonsNavigation
                            updateBcv={updateBcv}
                            rowData={rowData}

                            setSaveIngredientTsv={setSaveIngredientTsv}

                            ingredient={ingredient}
                            setIngredient={setIngredient}

                            currentRowN={currentRowN}
                            setCurrentRowN={setCurrentRowN}
                        />

                        <IconButton
                            onClick={() => handleOpenModalDelete()}
                            sx={{
                                mt: 2
                            }}
                        >
                            <DeleteIcon size="large" color="primary" />
                        </IconButton>
                    </>
                )}

            </Box>
            <DeleteNote
                mode="delete"
                open={openedModalDelete === "delete"}
                closeModal={() => setOpenedModalDelete(null)}
                ingredient={ingredient}
                setIngredient={setIngredient}
                rowData={rowData}
                setSaveIngredientTsv={setSaveIngredientTsv}
                currentRowN={currentRowN}
               
            />

        </Box>

    )
}

export default TsvLineForm;