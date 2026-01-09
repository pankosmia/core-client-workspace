import { DialogContent, DialogContentText } from "@mui/material";
import { PanDialog, PanDialogActions } from "pankosmia-rcl";
import { doI18n } from "pithekos-lib";
import I18nContext from "pithekos-lib/dist/contexts/i18nContext";
import { useContext, useState } from "react";

export default function DialogChangeBook({currentBook}) {

    const [book, setBook] = useState('');
    const [dialogIsOpen, setDialogIsOpen] = useState(true);
    const { i18nRef } = useContext(I18nContext);
    console.log("currentBook",currentBook)
    console.log("book",book);
    const handleDialogClose = () => {
        setDialogIsOpen(false);
    };
    const handleChangeBook = (b) => {
        setBook('');
    };
    return (
        <PanDialog
            titleLabel={doI18n("pages:core-local-workspace:change_book", i18nRef.current)}
            isOpen={dialogIsOpen}
            closeFn={() => handleDialogClose()}
        >
            <DialogContent>
                <DialogContentText>
                    {doI18n("pages:core-local-workspace:change_book_question", i18nRef.current)}
                </DialogContentText>
            </DialogContent>
            <PanDialogActions
                closeFn={() => handleDialogClose()}
                closeLabel={doI18n("pages:core-local-workspace:cancel", i18nRef.current)}
                actionLabel={doI18n("pages:core-local-workspace:accept", i18nRef.current)}
                actionFn={() => handleChangeBook(book)}
            />
        </PanDialog>
    );
}
