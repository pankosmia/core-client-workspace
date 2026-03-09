import { useState, useEffect, useRef } from "react";
import { Button, Box, Stack, Input } from "@mui/material";
import { ArrowCircleLeft, ArrowCircleRight } from "@mui/icons-material";

function JuxtaSentencesNav({
  onPrevHandler,
  onNextHandler,
  indexChangeHandler,
  sentences,
  currentChapter,
  startVerse,
  curIndex,
  endVerse,
  modified,
}) {
  const [inputValue, setInputValue] = useState(curIndex + 1);
  console.log(inputValue);
  // sync if curIndex changes externally (e.g. prev/next buttons)
  useEffect(() => {
    setInputValue(curIndex + 1);
  }, [curIndex]);
  let isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      const num = Number(inputValue);
      if (!num) return;
      const clamped = Math.min(num, sentences.length);
      // if clamped differs, correct the display
      if (clamped !== num) setInputValue(clamped);
      // call original handler with a synthetic-like event
      indexChangeHandler({ target: { value: String(clamped) } });
    }, 600);

    return () => clearTimeout(timeout);
  }, [inputValue]);

  return (
    <>
      <Button disabled={modified} onClick={onPrevHandler}>
        <ArrowCircleLeft size={32} />
      </Button>
      <Stack alignItems="center">
        <Box sx={{ color: "grey", fontSize: "14px" }}>
          Sentence
          <Input
            type="number"
            disabled={modified}
            value={inputValue}
            sx={{ width: "30px" }}
            inputProps={{ style: { textAlign: "center" } }}
            onChange={(e) => setInputValue(e.target.value)}
          />
          of {sentences.length} (ch:{currentChapter()}, v{startVerse()} -{" "}
          {endVerse()})
        </Box>
      </Stack>
      <Button disabled={modified} onClick={onNextHandler}>
        <ArrowCircleRight size={32} />
      </Button>
    </>
  );
}

export default JuxtaSentencesNav;
