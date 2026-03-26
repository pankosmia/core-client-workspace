import MenuItem from "@mui/material/MenuItem";
import { FormControl, InputLabel, Select } from "@mui/material";

export default function NumberPicker({
  state,
  setState,
  options,
  nameSelect
}) {

  return (
    <FormControl fullWidth>
      <InputLabel id="number-picker-button"> {nameSelect}</InputLabel>
      <Select
        id="number-picker-button"
        labelId="number-picker-button"
        onChange={(event) => {
          setState(event.target.value);
        }}
        value={state}
        label={nameSelect}
      >
        {
          options.map(
            o => <MenuItem key={o} value={o}>{o}</MenuItem>
          )
        }
      </Select>
    </FormControl>
  );
}