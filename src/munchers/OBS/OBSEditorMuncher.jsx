import { useState, useContext, useEffect } from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import OBSContext from "../../contexts/obsContext";
import OBSNavigator from "./components/OBSNavigator";
import SaveOBSButton from "./components/SaveOBSButton";
import AudioRecorder from "./components/AudioRecorder";
import MarkdownField from "../../components/MarkdownField";
import { IconButton, Menu, MenuItem } from "@mui/material";

import "./OBSMuncher.css";

import { debugContext as DebugContext } from "pankosmia-rcl";
import { getText, postText } from "pithekos-lib";
import md5 from "md5";
import Switch from "@mui/material/Switch";

function OBSEditorMuncher({ metadata }) {
  const { obs, setObs } = useContext(OBSContext);
  const { debugRef } = useContext(DebugContext);
  const [ingredient, setIngredient] = useState([]);
  const [audioUrl, setAudioUrl] = useState("");
  const [checksums, setChecksums] = useState({});
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [chapterChecksums, setChapterChecksums] = useState([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);
  const [isExportingParaEnabled, setIsExportingParaEnabled] = useState(false);

  /* Données de l'ingredient */
  const initIngredient = async () => {
    if (obs[0] < 0) obs[0] = 0;
    if (obs[0] > 50) obs[0] = 50;
    if (ingredient[obs[0]]) {
      return;
    }
    let fileName = obs[0] <= 9 ? `0${obs[0]}` : obs[0];
    const ingredientLink = `/burrito/ingredient/raw/${metadata.local_path}?ipath=content/${fileName}.md`;
    let response = await getText(ingredientLink, debugRef.current);
    if (response.ok) {
      const chapterContent = response.text
        .split(/\n\r?\n\r?/)
        .filter((_, index) => index % 2 === 0); // Lignes paires
      setIngredient((prevIngredient) => {
        const newIngredient = [...prevIngredient];
        newIngredient[obs[0]] = chapterContent;
        return newIngredient;
      });
      for (let i = 0; i < chapterContent.length; i++) {
        initChecksums(obs[0], i, chapterContent[i]);
      }
      const newChapterChecksums = [...chapterChecksums];
      newChapterChecksums[obs[0]] = calculateChapterChecksum(chapterContent);
      setChapterChecksums(newChapterChecksums);
    }
  };
  const handleChange = (event) => {
    setIngredient((prevIngredient) => {
      const newIngredient = [...prevIngredient];
      if (!newIngredient[obs[0]]) {
        newIngredient[obs[0]] = [];
      }
      newIngredient[obs[0]] = [...newIngredient[obs[0]]];
      newIngredient[obs[0]][obs[1]] = event.target.value.replaceAll(/\s/g, " ");
      return newIngredient;
    });
  };

  /* Vérification des sauvegardes */
  const calculateChapterChecksum = (chapter) => {
    if (!chapter) return 0;
    let checksum = 0;
    for (let i = 0; i < chapter.length; i++) {
      checksum += md5(chapter[i]);
    }
    return checksum;
  };

  const initChecksums = (chapterIndex, paragraphIndex, content) => {
    const key = `${chapterIndex}-${paragraphIndex}`;
    const checksum = md5(content);
    setChecksums((prev) => ({ ...prev, [key]: checksum }));
  };

  const isModified = () => {
    const chapterIndex = obs[0];
    const originalChecksum = chapterChecksums[chapterIndex];
    if (!originalChecksum) {
      return false;
    }
    const currentChecksum = calculateChapterChecksum(ingredient[chapterIndex]);

    return originalChecksum !== currentChecksum;
  };
  const updateChecksums = (chapterIndex) => {
    const chapter = ingredient[chapterIndex];
    if (!chapter) return;

    setChecksums((prev) => {
      const newChecksums = { ...prev };
      chapter.forEach((content, paragraphIndex) => {
        const key = `${chapterIndex}-${paragraphIndex}`;
        newChecksums[key] = md5(content);
      });
      return newChecksums;
    });

    setChapterChecksums((prev) => {
      const newChapterChecksums = [...prev];
      newChapterChecksums[chapterIndex] = calculateChapterChecksum(chapter);
      return newChapterChecksums;
    });
  };

  /* Systeme de sauvegarde */
  const handleSaveOBS = async () => {
    if (!ingredient || ingredient.length === 0) return;

    for (let i = 0; i < ingredient.length; i++) {
      if (!ingredient[i] || ingredient[i].length === 0) continue;
      await uploadOBSIngredient(ingredient[i], i);
    }
  };

  const uploadOBSIngredient = async (ingredientItem, i) => {
    let fileName = i <= 9 ? `0${i}` : i;
    const obsString = await getStringifyIngredient(ingredientItem, fileName);
    const payload = JSON.stringify({ payload: obsString });
    const response = await postText(
      `/burrito/ingredient/raw/${metadata.local_path}?ipath=content/${fileName}.md`,
      payload,
      debugRef,
      "application/json",
    );
    if (response.ok) {
      updateChecksums(i);
    } else {
      console.error(`Failed to save file ${fileName}`);
      throw new Error(
        `Failed to save file ${fileName}: ${response.status}, ${response.error}`,
      );
    }
  };
  const getOs = () => {
    const os = ["Windows", "Linux", "Mac"];
    return os.find((v) => navigator.userAgent.indexOf(v) >= 0);
  };
  const getStringifyIngredient = async (ingredientItem, fileName) => {
    const response = await getText(
      `/burrito/ingredient/raw/${metadata.local_path}?ipath=content/${fileName}.md`,
      debugRef,
    );
    if (response.ok) {
      const returnedText = response.text
        .split(/\n\r?\n\r?/)
        .map((line, index) => {
          if (index % 2 === 1) {
            return line.replaceAll(/\n/g, " ");
          } else {
            return ingredientItem[index / 2];
          }
        });
      // Detecter l'os
      if (getOs() === "Windows") {
        return returnedText.join("\r\n\r\n");
      } else {
        return returnedText.join("\n\n");
      }
    }
  };

  /* Gestion de l'audio */
  function AudioViewer({ chapter, paragraph }) {
    let chapterString = chapter < 10 ? `0${chapter}` : chapter;
    let paragraphString = paragraph < 10 ? `0${paragraph}` : paragraph;
  }

  const currentChapter = ingredient[obs[0]] || [];

  const updateIsExportingParaEnabled = async () => {
    if (obs[1] === 0) {
      setIsExportingParaEnabled(false);
    } else if ((await getMainTrack()) === null) {
      setIsExportingParaEnabled(false);
    } else {
      setIsExportingParaEnabled(true);
    }
  };

  useEffect(() => {
    handleSaveOBS();
    initIngredient().then();
  }, [obs[0]]);

  useEffect(() => {
    updateIsExportingParaEnabled();
  }, [obs]);

  // Intercepter les tentatives de navigation
  useEffect(() => {
    const isElectron = !!window.electronAPI;
    if (isElectron) {
      if (isModified()) {
        window.electronAPI.setCanClose(false);
      } else {
        window.electronAPI.setCanClose(true);
      }
    }
  }, [isModified]);

  const chapterTitle = (currentChapter[0] || "").replace(/^#+\s*/, "").trim();

  const getMainTrack = async () => {
    const url = `/burrito/paths/${metadata.local_path}`;
    const response = await fetch(url, {
      method: "GET",
    });
    const data = await response.json();
    let chapterString = obs[0] < 10 ? `0${obs[0]}` : obs[0];
    let paragraphString = obs[1] < 10 ? `0${obs[1]}` : obs[1];
    const dataFiltered = data.filter(
      (item) =>
        item.includes(
          `audio_content/${chapterString}-${paragraphString}/${chapterString}-${paragraphString}_0`,
        ) && !item.includes(".bak"),
    );
    return dataFiltered.length > 0 ? dataFiltered[0] : null;
  };

  const handleExportVideoParagraph = async () => {
    setMenuAnchorEl(null);
    const videoUrl = `/video/obs-para/${metadata.local_path}`;
    const json = {
      story_n: obs[0],
      para_n: obs[1],
      audio_path: await getMainTrack(),
    };
    const response = await fetch(videoUrl, {
      method: "POST",
      body: JSON.stringify(json),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log(data);
  };

  const handleExportVideoStory = async () => {
    setMenuAnchorEl(null);

    const videoUrl = `/video/obs-story/${metadata.local_path}`;
    const json = {
      story_n: obs[0],
    };
    const response = await fetch(videoUrl, {
      method: "POST",
      body: JSON.stringify(json),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log(data);
  };

  return (
    <Stack sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "left",
          alignItems: "center",
          mb: 1,
        }}
      >
        {/* <Box /> */}
        <Box>
          <SaveOBSButton
            obs={obs}
            isModified={isModified}
            handleSave={handleSaveOBS}
          />
        </Box>
        <Box sx={{ ml: 2 }}>
          Audio
          <Switch
            checked={audioEnabled}
            onChange={() => setAudioEnabled(!audioEnabled)}
          />
        </Box>
        <Box>
          <IconButton
            id="obs-export-button"
            aria-controls={isMenuOpen ? "obs-export-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={isMenuOpen ? "true" : undefined}
            onClick={(event) => setMenuAnchorEl(event.currentTarget)}
          >
            <ImportExportIcon />
          </IconButton>
          <Menu
            id="obs-export-menu"
            anchorEl={menuAnchorEl}
            open={isMenuOpen}
            onClose={() => setMenuAnchorEl(null)}
            slotProps={{ list: { "aria-labelledby": "obs-export-button" } }}
          >
            <MenuItem
              onClick={() => handleExportVideoParagraph()}
              disabled={!isExportingParaEnabled}
            >
              Export video paragraph
            </MenuItem>
            <MenuItem onClick={() => handleExportVideoStory()}>
              Export video story
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      <OBSNavigator max={currentChapter.length - 1} title={chapterTitle} />
      <Stack>
        <MarkdownField
          currentRow={obs[1]}
          columnNames={currentChapter}
          onChangeNote={handleChange}
          value={currentChapter[obs[1]] || ""}
          mode="write"
        />
        {audioEnabled && (
          <AudioRecorder
            audioUrl={audioUrl}
            setAudioUrl={setAudioUrl}
            metadata={metadata}
            obs={obs}
          />
        )}
      </Stack>
    </Stack>
  );
}

export default OBSEditorMuncher;
