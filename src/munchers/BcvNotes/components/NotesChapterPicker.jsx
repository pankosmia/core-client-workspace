import { Box, List, ListItem, TextField, MenuItem, IconButton } from "@mui/material";
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

function NotesChapterPicker({ ingredient, currentChapter, setCurrentChapter }) {

  // Permet d'afficher tous les versets 
  const bookCode = [...new Set(ingredient.map(l => l[0].split(':')[0]))];
  const chapters = bookCode.slice(1).filter(chap => chap && chap.trim() !== "").sort((a, b) => parseInt(a) - parseInt(b));

  const currentIndex = chapters.indexOf(currentChapter);
  
  const previousChapter = () => {
    if (currentIndex > 0) {
      setCurrentChapter(chapters[currentIndex - 1]);
    }
  };

  const nextChapter = () => {
    if (currentIndex < chapters.length - 1) {
      setCurrentChapter(chapters[currentIndex + 1]);
    }
  };

  return (
    <Box 
      sx={{ 
        display: "flex", 
        alignItems: "center",
        justifyContent: "center",
        gap: 0.5 
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, width: "100%" }}>
        <IconButton 
          size="small" 
          onClick={previousChapter}
          disabled={currentIndex <= 0}
          sx={{ p: 0.5 }}
        >
          <KeyboardArrowLeftIcon />
        </IconButton>
        <TextField
          select
          label="Ch"
          size="small"
          fullWidth
          value={currentChapter}
          onChange={(e) => setCurrentChapter(e.target.value)}
        >
          {chapters.map((chap) => (
            <MenuItem 
              key={chap} 
              value={chap}
              sx={{ maxHeight: "3rem", height: "2rem" }} 
            >
              {chap}
            </MenuItem>
          ))}
        </TextField>
        <IconButton 
            size="small" 
            onClick={nextChapter}
            disabled={currentIndex >= chapters.length - 1}
        >
          <KeyboardArrowRightIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

export default NotesChapterPicker;
