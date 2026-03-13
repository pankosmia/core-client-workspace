import React, { useState } from "react";
import { Button, Input, Stack, InputProps, Box } from "@mui/material";
import Markdown from "react-markdown";
import { Edit } from "@mui/icons-material";
import { CheckBox } from "@mui/icons-material";
export const MarkdownInput = (props: InputProps) => {
  const value = (props.value as string) ?? "";

  return (
    <Box
      display="inline-flex"
      minWidth="30px"
      maxWidth="100%"
      position="relative"
      minHeight="100%"
    >
      <Box
        component="span"
        sx={{
          visibility: "hidden",
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          wordBreak: "break-word",
          font: "inherit",
          fontSize: "1rem",
          pl: "8px",
          pr: "30px",
          minWidth: "30px",
          maxWidth: "100%",
          display: "block",
        }}
      >
        {value || " "}
      </Box>
      <Input
        multiline
        maxRows={6}
        sx={{
          background: "lightgrey",
          pl: "8px",
          
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          "& textarea": {
            padding: 0,
            resize: "none",
            whiteSpace: "pre-wrap",
            overflowWrap: "break-word",
            wordBreak: "break-word",
          },
        }}
        {...props}
      />
    </Box>
  );
};
