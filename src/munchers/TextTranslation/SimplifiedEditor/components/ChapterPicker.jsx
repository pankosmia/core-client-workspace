import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { Box, IconButton, MenuItem, TextField } from "@mui/material";
import { ButtonGroup } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { getJson, postEmptyJson } from "pithekos-lib";
import { bcvContext, debugContext } from "pankosmia-rcl";
function ChapterPicker({ repoMetadata, chapterNumbers }) {
  const [scriptDirection, setScriptDirection] = useState([]);
  const { bcvRef, systemBcv } = useContext(bcvContext);
  const [currentPosition, setCurrentPosition] = useState(
    chapterNumbers.indexOf(bcvRef.current.chapterNum),
  );
  const { debugRef } = useContext(debugContext);
  const projectScriptDirection = async () => {
    const summariesResponse = await getJson(
      `/burrito/metadata/summary/${repoMetadata.local_path}`,
    );
    if (summariesResponse.ok) {
      const data = summariesResponse.json;
      setScriptDirection(data?.script_direction ?? undefined);
    } else {
      console.error(" Erreur lors de la récupération des données.");
    }
  };

  useEffect(() => {
    projectScriptDirection().then();
  }, []);

  // changer de page -1
  const previousChapter = () => {
    if (currentPosition > 0) {
      setCurrentPosition(currentPosition - 1);
      postEmptyJson(
        `/navigation/bcv/${systemBcv["bookCode"]}/${chapterNumbers[currentPosition - 1]}/1`,
        debugRef.current,
      );
    }
  };

  // changer de page +1
  const nextChapter = () => {
    if (currentPosition < chapterNumbers.length - 1) {
      setCurrentPosition(currentPosition + 1);
      postEmptyJson(
        `/navigation/bcv/${systemBcv["bookCode"]}/${chapterNumbers[currentPosition + 1]}/1`,
        debugRef.current,
      );
    }
  };

  const handleClickMenuChapter = (i) => {
    setCurrentPosition(i);
    postEmptyJson(
      `/navigation/bcv/${systemBcv["bookCode"]}/${chapterNumbers[i]}/1`,
      debugRef.current,
    );
  };

  return (
    <Box
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      {scriptDirection === "rtr" ? (
        <ButtonGroup>
          <IconButton
            onClick={() => {
              previousChapter();
            }}
          >
            <KeyboardArrowRightIcon fontSize="small" />
          </IconButton>
        </ButtonGroup>
      ) : (
        <ButtonGroup>
          <IconButton
            disabled={currentPosition < 1}
            onClick={() => {
              previousChapter();
            }}
          >
            <KeyboardArrowLeftIcon fontSize="small" />
          </IconButton>
        </ButtonGroup>
      )}

      <TextField
        label={`Ch`}
        select
        size="small"
        value={bcvRef.current.chapterNum}
      >
        {chapterNumbers.map((chapter, index) => (
          <MenuItem
            onClick={() => handleClickMenuChapter(index)}
            key={index}
            value={chapter}
            sx={{ maxHeight: "3rem", height: "2rem" }}
          >
            {chapter}
          </MenuItem>
        ))}
      </TextField>

      {scriptDirection === "rtr" ? (
        <ButtonGroup>
          <IconButton
            onClick={() => {
              nextChapter();
            }}
          >
            <KeyboardArrowLeftIcon fontSize="small" />
          </IconButton>
        </ButtonGroup>
      ) : (
        <ButtonGroup>
          <IconButton
            disabled={currentPosition >= chapterNumbers.length - 1}
            onClick={() => {
              nextChapter();
            }}
          >
            <KeyboardArrowRightIcon fontSize="small" />
          </IconButton>
        </ButtonGroup>
      )}
    </Box>
  );
}

export default ChapterPicker;
