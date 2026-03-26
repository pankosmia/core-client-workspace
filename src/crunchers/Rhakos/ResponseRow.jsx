import { Grid2, IconButton, Typography } from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";
import { useState } from "react";
import InformationDialogRhakos from "./InformationDialog";

export default function ResponseRow({ n, response }) {
  const [openDialogInfo, setOpenDialogInfo] = useState(false);

  return (
    <>
      <Grid2 key={`p-${n}`} item size={3}>
        <Typography align="left">{response.json.prompt}{" ("}{response?.json?.book}{" "}{response?.json?.from_chapter}{":"}
            {response?.json?.from_verse}{")"}</Typography>
      </Grid2>
      <Grid2 key={`r-${n}`} item size={8}>
        <Typography align="left">{response.json.response.replace(/^[\s\S]*<\/think>/, "")}</Typography>
      </Grid2>
      <Grid2 key={`info-${n}`} item size={1}>
        <IconButton onClick={() => setOpenDialogInfo(!openDialogInfo)}>
          <InfoOutlined />
        </IconButton>
        <InformationDialogRhakos
          open={openDialogInfo}
          close={setOpenDialogInfo}
          response={response}
        />
      </Grid2>
    </>
  );
}
