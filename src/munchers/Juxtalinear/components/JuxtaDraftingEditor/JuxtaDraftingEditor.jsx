import { useEffect, useContext, useState } from "react";
import { getText, getJson } from "pithekos-lib";
import {
  bcvContext as BcvContext,
  debugContext as DebugContext,
} from "pankosmia-rcl";
import { Box, Typography } from "@mui/material";
import md5sum from "md5";
import JuxtaEditorTools from "../JuxtaEditorTools/JuxtaEditorTools";
import JuxtaEditable from "../JuxtaEditable";

function JuxtaDraftingEditor({
  metadata,
  modified,
  setModified,
  locationState,
}) {
  const { systemBcv } = useContext(BcvContext);
  const { debugRef } = useContext(DebugContext);
  const [scriptureJson, setScriptureJson] = useState({
    headers: {},
    blocks: [],
  });
  const [md5sumScriptureJson, setMd5sumScriptureJson] = useState([]);
  const [currentBookCode, setCurrentBookCode] = useState(null);
  const [ingredient, setIngredient] = useState(null);

  const [fileName, setFileName] = useState("");
  const [sentences, setSentences] = useState([]);
  const [originText, setOriginText] = useState([]);
  const [itemArrays, setItemArrays] = useState([]);
  const [curIndex, setCurIndex] = useState(0);
  const [textDir, setTextDir] = useState(
    metadata?.script_direction
      ? metadata.script_direction.toLowerCase()
      : undefined,
  );
  const remakeSentences = (stcs) =>
    stcs.map((stc) => {
      const counts = {};
      const chunks = stc.chunks
        .filter((c) => c.source[0])
        .map((chunk) => ({
          source: chunk.source.map((src) => {
            counts[src.content] = counts[src.content] || 0;
            const index = counts[src.content]++;
            return { ...src, index };
          }),
          gloss: chunk.gloss,
        }));

      return {
        originalSource: stc.originalSource,
        chunks,
        sourceString: stc.sourceString,
      };
    });


  const setGlobalItemArrays = (index, itemArr) => {
    setItemArrays((prev) => {
      const next = [...prev];
      next[index] = itemArr;
      return next;
    });
  };

  const setGlobalSentences = (index, sentence) => {
    setSentences((prev) => {
      const next = [...prev];
      next[index] = sentence;
      return next;
    });
  };
  useEffect(() => {
    if (sentences.length) {
      setGlobalItemArrays(curIndex, getItems());
    }
  }, [sentences, curIndex]);
  const getItems = () => getItemsFrom(sentences, curIndex);
  const getItemsFrom = (stcs, index) =>
    stcs[index].chunks
      .map(({ source, gloss }, i) => ({
        chunk: source.filter(Boolean).map((s, n) => ({
          id: `item-${i * 1000 + n}`,
          content: s.content,
          index: s.index,
        })),
        gloss,
      }))
      .filter((c) => c.chunk.length);
  useEffect(() => {
    if (!ingredient) return;

    const openJsonHandler = async () => {
      const stcs = ingredient;
      setFileName("ici");
      setCurIndex(0);
      setSentences(remakeSentences(stcs));
      setOriginText(stcs.map((s) => s.sourceString));
      setItemArrays([getItemsFrom(stcs, 0)]);
    };

    openJsonHandler();
  }, [ingredient]);
  const sbScriptDir = metadata?.script_direction
    ? metadata.script_direction.toLowerCase()
    : undefined;
  const sbScriptDirSet = sbScriptDir === "ltr" || sbScriptDir === "rtl";

  // Set up 'are you sure you want to leave page' for Electron
  useEffect(() => {
    const isElectron = !!window.electronAPI;
    if (isElectron) {
      window.electronAPI.setCanClose(!modified);
    }
  }, [modified]);

  // Get whole book content
  useEffect(() => {
    const getAllData = async () => {
      if (currentBookCode) {
        setCurIndex(0)
        const ingredientLink = `/burrito/ingredient/raw/${metadata.local_path}?ipath=${currentBookCode}.json`;
        let response = await getJson(ingredientLink, debugRef.current);
        if (response.ok) {
          setIngredient(response.json);
        } else {
          setIngredient([]);
        }
      }
    };
    getAllData();
  }, [currentBookCode]);

  return (
    <>
      <JuxtaEditorTools
        metadata={metadata}
        JuxtaEditorToolsEditorTools
        modified={modified}
        setModified={setModified}
        md5sumScriptureJson={md5sumScriptureJson}
        setMd5sumScriptureJson={setMd5sumScriptureJson}
        scriptureJson={scriptureJson}
        currentBookCode={currentBookCode}
        setCurrentBookCode={setCurrentBookCode}
        curIndex={curIndex}
        setCurIndex={setCurIndex}
        sentences={sentences}
      />
      {/** If SB does not specify direction then it is set here, otherwise it has already been set per SB in WorkspaceCard */}
      <Box dir={!sbScriptDirSet ? textDir : undefined}>
        {ingredient ? (
          <JuxtaEditable
            metadata={metadata}
            ingredient={ingredient}
            setGlobalSentences={setGlobalSentences}
            setGlobalItemArrays={setGlobalItemArrays}
            curIndex={curIndex}
            sentences={sentences}
            itemArrays={itemArrays}
            originText={originText}
            remakeSentences={remakeSentences}
          />
        ) : (
          <Typography> loading ...</Typography>
        )}
      </Box>
    </>
  );
}

export default JuxtaDraftingEditor;
