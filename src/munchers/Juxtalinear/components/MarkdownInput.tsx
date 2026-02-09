import React, { useState } from "react";
import { Button, Input, Stack, InputProps, Box } from "@mui/material";
import Markdown from "react-markdown";
import { Edit } from "@mui/icons-material";
import { CheckBox } from "@mui/icons-material";
export const MarkdownInput = (props: InputProps) => {
  return (
    <Stack
      flexDirection={"row"}
      sx={{ background: "lightgrey", width: "100%", height: "36px", pl: "8px" }}
    >
      <Box flexGrow={1}>
        <Input {...props} fullWidth></Input>
      </Box>
    </Stack>
  );
};
