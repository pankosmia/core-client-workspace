import { MenuItem, TextField } from "@mui/material";

export default function BookPicker({ setFirstChapter }) {
  return (
    <TextField
      disabled={disabledBook}
      label={`${doI18n("pages:core-local-workspace:book", i18nRef.current)}`}
      fullWidth
      id="book-button"
      size="small"
      select
      value={bcvRef.current.bookCode}
    >
      {contentBooks.map((b, n) => (
        <MenuItem
          sx={{ maxHeight: "3rem", height: "2rem" }}
          value={b}
          key={n}
          onClick={() => changeBook(b)}
        >
          {doI18n(`scripture:books:${b}`, i18nRef.current)}
        </MenuItem>
      ))}
    </TextField>
  );
}
