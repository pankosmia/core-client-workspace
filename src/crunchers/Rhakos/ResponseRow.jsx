import { Grid2, IconButton } from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";
import { useState } from "react";
import InformationDialogRhakos from "./InformationDialog";

export default function ResponseRow({ n, response }) {
  const [openDialogInfo, setOpenDialogInfo] = useState(false);

  return (
    <>
      <Grid2 key={`p-${n}`} item size={3}>
        {response.json.prompt}
      </Grid2>
      <Grid2 key={`r-${n}`} item size={8}>
        {response.json.response.replace(/^[\s\S]*<\/think>/, "")}
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
