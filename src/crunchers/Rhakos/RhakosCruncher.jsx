import { useContext, useState, useEffect } from "react";
import {
  Box,
  Grid2,
  TextField,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { doI18n, getJson, postJson, getText } from "pithekos-lib";
import {
  i18nContext as I18nContext,
  debugContext as DebugContext,
  bcvContext as BcvContext,
} from "pankosmia-rcl";
import { Proskomma } from "proskomma-core";
import SettingsIcon from "@mui/icons-material/Settings";
import SendIcon from "@mui/icons-material/Send";
import DialogConfig from "./DialogConfig";
import DialogResources from "./DialogResources";
import ResponseRow from "./ResponseRow";

function RhakosCruncher({ metadata, style }) {
  const { i18nRef } = useContext(I18nContext);
  const { debugRef } = useContext(DebugContext);
  const { bcvRef } = useContext(BcvContext);

  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(["qwen3-4b", true]);
  const [temperature, setTemperature] = useState(0.6);
  const [topK, setTopK] = useState(20);
  const [resources, setResources] = useState({
    translations: [],
    juxtas: [],
    notes: [],
  });
  const [prompt, setPrompt] = useState("");
  const [processing, setProcessing] = useState(false);
  const [responses, setResponses] = useState([]);
  const [openDialogConfig, setOpenDialogConfig] = useState(false);
  const [openDialogResources, setOpenDialogResources] = useState(false);

  useEffect(() => {
    const getModels = async () => {
      const result = await getJson("/llm/model", debugRef.current);
      if (result.ok) {
        setModels(result.json);
      }
    };
    if (models.length === 0) {
      getModels().then();
    }
  },
  []);

  const selectedResources = (category) =>
    resources[category].filter((ra) => ra[1]).map((ra) => ra[0]);

  const makeRagContext = async () => {
    let translationPromptStringEntries = [];
    for (const t of selectedResources("translations")) {
      // Load USFM of correct book
      let usfmResponse = await getText(
        `/burrito/ingredient/raw/${t.path}?ipath=${bcvRef.current.bookCode}.usfm`,
        debugRef.current,
      );
      if (usfmResponse.ok) {
        // Import into Pk
        const pk = new Proskomma();
        pk.importDocument(
          { lang: "xxx", abbr: "yyy" },
          "usfm",
          usfmResponse.text,
        );
        // Query verse
        const pkQuery = `{
          documents {
            cvIndex(chapter: ${bcvRef.current.chapterNum}) {
              verses {
                verse {
                  text(normalizeSpace: true)
                }
              }
            }
          }
        }`;
        const pkResult = pk.gqlQuerySync(pkQuery);
        if (!pkResult.data) {
          console.log(`Error on Pk query: ${pkResult}`);
          return;
        }
        // Return name/verseText tuple
        const verseText =
          pkResult.data.documents[0].cvIndex.verses[bcvRef.current.verseNum];
        if (
          verseText &&
          verseText.verse &&
          verseText.verse[0] &&
          verseText.verse[0].text
        ) {
          translationPromptStringEntries.push([
            t.name,
            verseText.verse[0].text,
          ]);
        }
      } else {
        console.log(`Error on USFM load! ${usfmResponse.error}`);
        return;
      }
    }

    const allNoteStringEntries = [];
    for (const t of selectedResources("notes")) {
      // Load TSV of correct book
      let tsvResponse = await getText(
        `/burrito/ingredient/raw/${t.path}?ipath=${bcvRef.current.bookCode}.tsv`,
        debugRef.current,
      );
      if (tsvResponse.ok) {
        let tsvLines = tsvResponse.text
          .split("\n")
          .slice(1)
          .map((l) => l.split("\t").map((c) => c.trim()))
          .filter((l) => l.length !== 0)
          .filter(
            (l) =>
              l[0] ===
              `${bcvRef.current.chapterNum}:${bcvRef.current.verseNum}`,
          );
        allNoteStringEntries.push([t.name, tsvLines.map((l) => l[6])]);
      } else {
        console.log(`Error on TSV load! ${tsvResponse.error}`);
        return;
      }
    }

    // Split notes depending on whether they have bold markup not containing references ('snippets')
    let notePromptStrings = {};
    let snippetPromptStrings = {};
    const re = new RegExp(/\*\*([^*]*[A-Za-z]+[^*]*)\*\*/g);
    for (const noteEntry of allNoteStringEntries) {
      for (const noteString of noteEntry[1]) {
        const captured = re.exec(noteString);
        if (captured) {
          // snippet
          if (!(captured[1] in snippetPromptStrings)) {
            snippetPromptStrings[captured[1]] = [];
          }
          snippetPromptStrings[captured[1]].push(noteString);
        } else {
          // note
          if (!(noteEntry[0] in notePromptStrings)) {
            notePromptStrings[noteEntry[0]] = [];
          }
          notePromptStrings[noteEntry[0]].push(noteString);
        }
      }
    }

    let juxtaPromptString = "";
    const juxtaResource = selectedResources("juxtas")[0];
    if (juxtaResource) {
      // Load JSON of correct book
      let juxtaResponse = await getJson(
        `/burrito/ingredient/raw/${juxtaResource.path}?ipath=${bcvRef.current.bookCode}.json`,
        debugRef.current,
      );
      if (juxtaResponse.ok) {
        // Find sentence(s) for verse
        let cv = `${bcvRef.current.chapterNum}:${bcvRef.current.verseNum}`;
        let verseSentences = juxtaResponse.json.filter(
          (s) =>
            s.chunks.filter(
              (c) => c.source.filter((so) => so.cv === cv).length > 0,
            ).length > 0,
        );
        // Find verses in sentence(s)
        let cvSet = new Set([]);
        for (const sentence of verseSentences) {
          for (const chunk of sentence.chunks) {
            for (const source of chunk.source) {
              cvSet.add(source.cv);
            }
          }
        }

        // extract Greek and gloss for each chunk
        let juxtaChunks = [];
        for (const sentence of verseSentences) {
          for (const chunk of sentence.chunks) {
            juxtaChunks.push([
              chunk.source.map((s) => s.content).join(" "),
              chunk.gloss,
            ]);
          }
        }
        // Build juxta prompt
        juxtaPromptString = `This verse spans ${verseSentences.length} greek sentence${verseSentences.length === 1 ? "" : "s"} containing ${cvSet.size} verse${cvSet.size === 1 ? "" : "s"}. Here is the juxtalinear rendering of ${verseSentences.length === 1 ? "that" : "those"} greek sentence${verseSentences.length === 1 ? "" : "s"}. Each sentence has been broken into short chunks. Each chunk contains greek words followed by a very literal translation (between parentheses). The chunks are as follows:\n\n`;
        juxtaPromptString += juxtaChunks.map(c => `- ${c[0]} (${c[1]})`).join("\n");
        juxtaPromptString += "\n\nOnly include the juxtalinear in your answer if the user asks about greek, or if the juxtalinear is directly relevant to the question. For example, the juxtalinear may help the user to see the literal meaning of a text.";
      }
    }

    return {
      model_name: selectedModel[0],
      quantized: selectedModel[1],
      book: bcvRef.current.bookCode,
      from_chapter: bcvRef.current.chapterNum,
      from_verse: bcvRef.current.verseNum,
      prompt: prompt,
      show_prompt: true,
      top_k: topK,
      temperature: temperature,
      rag_context: {
        juxta: juxtaPromptString,
        translations: Object.fromEntries(translationPromptStringEntries),
        notes: notePromptStrings,
        snippets: snippetPromptStrings,
      },
    };
  };

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Grid2
        container
        direction="row"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        columnSpacing={0.5}
        rowSpacing={1}
      >
        <Grid2
          container
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          item
          size={12}
        >
          <Grid2 item size="grow">
            <TextField
              fullWidth
              label={`
            ${doI18n("pages:core-local-workspace:model_rhakos", i18nRef.current)} ${selectedModel[0]}, 
            ${doI18n("pages:core-local-workspace:topk_rhakos", i18nRef.current)} ${topK},
            ${doI18n("pages:core-local-workspace:temperature_rhakos", i18nRef.current)} ${temperature}
            `}
              slotProps={{
                input: {
                  readOnly: true,
                },
                inputLabel: {
                  shrink: false,
                },
              }}
            />
          </Grid2>
          <Grid2 item size={{ "@xs": 2, "@md": 1 }}>
            <IconButton onClick={() => setOpenDialogConfig(true)}>
              <SettingsIcon />
            </IconButton>
          </Grid2>
        </Grid2>

        <Grid2
          container
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          item
          size={12}
        >
          <Grid2 item size="grow">
            <TextField
              fullWidth
              label={
                [
                  ...new Set(
                    Object.values(resources)
                      .reduce((a, b) => [...a, ...b], [])
                      .filter((ra) => ra[1])
                      .map((ra) => ra[0].abbreviation),
                  ),
                ].join(", ") ||
                doI18n(
                  "pages:core-local-workspace:no_resources_chosen",
                  i18nRef.current,
                )
              }
              slotProps={{
                input: {
                  readOnly: true,
                },
                inputLabel: {
                  shrink: false,
                },
              }}
            />
          </Grid2>
          <Grid2 item size={{ "@xs": 2, "@md": 1 }}>
            <IconButton onClick={() => setOpenDialogResources(true)}>
              <SettingsIcon />
            </IconButton>
          </Grid2>
        </Grid2>
        <Grid2 item size="grow">
          <TextField
            fullWidth
            disabled={processing}
            id="prompt"
            label={doI18n(
              "pages:core-local-workspace:prompt_rhakos",
              i18nRef.current,
            )}
            value={prompt}
            onChange={(event) => {
              setPrompt(event.target.value);
            }}
          />
        </Grid2>
        <Grid2 item size={{ "@xs": 2, "@md": 1 }} sx={{ display: "flex" }}>
          <IconButton
            fullWidth
            disabled={processing || prompt === ""}
            onClick={async () => {
              let rag_context =  await makeRagContext();
              setProcessing(true);
              const result = await postJson(
                "/llm/rag-prompt",
                JSON.stringify(rag_context),
                debugRef.current,
              );
              setResponses([...responses, result]);
              setProcessing(false);
              setPrompt("");
            }}
          >
            {processing ? (
              <CircularProgress enableTrackSlot size={25} color="inherit" />
            ) : (
              <SendIcon />
            )}
          </IconButton>
        </Grid2>
      </Grid2>
      <Grid2
        container
        columnSpacing={0.5}
        rowSpacing={1}
        sx={{
          direction: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          paddingTop: 2,
        }}
      >
        {[...responses].reverse().map((r, n) => (
          <ResponseRow n={n} response={r} />
        ))}
      </Grid2>
      <DialogConfig
        open={openDialogConfig}
        close={setOpenDialogConfig}
        models={models}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        topK={topK}
        setTopK={setTopK}
        temperature={temperature}
        setTemperature={setTemperature}
      />
      <DialogResources
        open={openDialogResources}
        close={setOpenDialogResources}
        resources={resources}
        setResources={setResources}
      />
    </Box>
  );
}

export default RhakosCruncher;
