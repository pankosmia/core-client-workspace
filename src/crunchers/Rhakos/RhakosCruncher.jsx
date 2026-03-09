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
  });

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
  makeRagContext().then((r) => console.log(r));

  const rag_context = {
    model_name: selectedModel[0],
    quantized: selectedModel[1],
    book: "JHN",
    from_chapter: 3,
    from_verse: 16,
    prompt: prompt,
    show_prompt: true,
    top_k: topK,
    temperature: temperature,
    rag_context: {
      juxta:
        "This verse is one complete Greek sentence. Here is the juxtalinear rendering of that Greek sentence. The sentence has been broken into short chunks. Each chunk contains Greek words followed by a very literal translation (between parentheses). The chunks are as follows:\n\n- γὰρ ὁ Θεὸς (For God)\n- ἠγάπησεν οὕτως τὸν κόσμον (loved thus the world)\n- ὥστε ἔδωκεν (so-that he-gave)\n- τὸν Υἱὸν τὸν μονογενῆ (the son only)\n- ἵνα πᾶς ὁ πιστεύων εἰς αὐτὸν (so-that whoever believing in him)\n- μὴ ἀπόληται (not shall-be-destroyed)\n- ἀλλ’ ἔχῃ ζωὴν αἰώνιον (but shall-have life eternal)\n\nOnly include the juxtalinear in your answer if the user asks about Greek, or if the juxtalinear is directly relevant to the question.",
      translations: {
        "Berean Standard Bible":
          "For God so loved the world that He gave His one and only Son, that everyone who believes in Him shall not perish but have eternal life.",
        "unfoldingWord Literal Text":
          "For God so loved the world, that he gave his One and Only Son, so that everyone believing in him would not perish but would have eternal life.",
        "World English Bible":
          "For God so loved the world, that he gave his only born Son, that whoever believes in him should not perish, but have eternal life.",
        "unfoldingWord Simplified Text":
          "This is because God loved the world’s people in this way, so that he gave his Unique Son in order that anyone who trusts in his Son would not die but would live forever.",
      },
      notes: {
        "Tyndale Study Notes": [
          "The truth that God loved the world is basic to Christian understanding ( 1 Jn 4:9-10 ). God’s love extends beyond the limits of race and nation, even to those who oppose him. • The Son came to save—not condemn ( Jn 3:17 )—men and women who habitually embrace the darkness ( Jn 3:19-21 ).",
        ],
      },
      snippets: {
        for: [
          "For here indicates that Jesus is giving a reason why the statement in the previous two verses is true. If it would be helpful in your language, you could express the meaning explicitly. Alternate translation: “This is true because”",
        ],
        so: [
          "Here, so could refer to: (1) the manner in which God loved the world. Alternate translation, as in the UST: “God loved the world in this way” (2) the degree to which God loved the world. Alternate translation: “God loved the world so much” (3) both the manner in which and the degree to which God loved the world. For this interpretation, see the discussion of John’s use of double meaning in Part 3 of the Introduction to this book. Alternate translation: “in this way God loved the world so much”",
        ],
        world: [
          "# world, worldly\n\n## Definition:\n\nThe term “world” usually refers to the part of the universe where people live: the earth. The term “worldly” describes the evil values and behaviors of people living in this world.\n\n* In its most general sense, the term “world” refers to the heavens and the earth, as well as everything in them.\n* In many contexts, “world” actually means “people in the world.”\n* Sometimes it is implied that this refers to the evil people on earth or the people who do not obey God.\n* The apostles also used “world” to refer to the selfish behaviors and corrupt values of the people living in this world. This can include self-righteous religious practices which are based on human efforts.\n* People and things characterized by these values are said to be “worldly.”\n\n## Translation Suggestions:\n\n* Depending on the context, “world” could also be translated as “universe” or “people of this world” or “corrupt things in the world” or “evil attitudes of people in the world.”\n* The phrase “all the world” often means “many people” and refers to the people living in a certain region. For example, “all the world came to Egypt” could be translated as “many people from the surrounding countries came to Egypt” or “people from all the countries surrounding Egypt came there.”\n* Another way to translate “all the world went to their hometown to be registered in the Roman census” would be “many of the people living in regions ruled by the Roman empire went…”\n* Depending on the context, the term “worldly” could be translated as “evil” or “sinful” or “selfish” or “ungodly” or “corrupt” or “influenced by the corrupt values of people in this world.”\n* The phrase “saying these things in the world” can be translated as “saying these things to the people of the world.”\n* In other contexts, “in the world” could also be translated as “living among the people of the world” or “living among ungodly people.”",
        ],
        that: [
          "Here, that introduces the result of what the previous clause stated. If it would be helpful in your language, you could express the meaning explicitly. Alternate translation: “as a result”",
        ],
        "one and only son": [
          "Here, One and Only Son refers to Jesus. If this might confuse your readers, you could express the meaning explicitly. Alternate translation: “his One and Only Son, Jesus”",
          "Here and throughout John’s Gospel, the phrase One and Only is a title for Jesus that could refer to: (1) Jesus being unique as the only member of his kind. Alternate translation: “his Unique Son” (2) Jesus being the only child of his Father. Alternate translation: “his Only Begotten Son”",
          "One and Only Son is an important title for Jesus.",
        ],
      },
    },
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
