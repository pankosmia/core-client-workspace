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
  return (
    <>
      <Button disabled={modified} onClick={onPrevHandler}>
        <ArrowCircleLeft size={32} />
      </Button>
      <Stack alignItems="center">
        <Box sx={{ color: "grey", fontSize: "14px" }}>
          Sentence
          <Input
            disabled={modified}
            value={sentences.length ? curIndex + 1 : 0}
            sx={{ width: "30px" }}
            inputProps={{
              style: {
                textAlign: "center",
              },
            }}
            onChange={indexChangeHandler}
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
