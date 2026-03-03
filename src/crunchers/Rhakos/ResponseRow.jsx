import { InfoOutlined } from "@mui/icons-material";
import Markdown from 'react-markdown';

export default function ResponseRow({ n, response }) {
  return (
    <>
      <Grid2 key={`p-${n}`} item size={3}>
        {response.json.prompt}
      </Grid2>
      <Grid2 key={`r-${n}`} item size={8}>
        {!showFullPrompt ? (
          response.json.response.replace(/^[\s\S]*<\/think>/, "")
        ) : (
          <>
            <Markdown>
              {response.json.response.replace(/^([\s\S]*?)<[\s\S]*/, (a, b) => b)}
            </Markdown>

            <Markdown>
              {response.json.response.replace(/^[\s\S]*<\/think>/, "")}
            </Markdown>
          </>
        )}
      </Grid2>
      <Grid2 key={`info-${n}`} item size={1}>
        <IconButton onClick={() => handleClickOpenDialogInfo(r)}>
          <InfoOutlined />
        </IconButton>
      </Grid2>
    </>
  );
}
