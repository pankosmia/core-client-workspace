import React, { useContext, useEffect, useRef, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Grid,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { ArrowDropUp, ArrowDropDown } from "@mui/icons-material";
import { DragDropContext, StrictModeDroppable, Draggable } from "./Droppable";
import { getJson } from "pithekos-lib";
import { bcvContext, debugContext } from "pankosmia-rcl";
import "./Home.css";
import { MarkdownInput } from "./MarkdownInput";

const grid = 3;

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: "none",
  padding: grid * 2,
  margin: `0 ${grid}px 0 0`,
  background: isDragging ? "lightgreen" : "lightgrey",
  ...draggableStyle,
});

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  display: "flex",
  padding: grid,
  overflow: "auto",
});

function JuxtaEditable({
  metadata,
  ingredient,
  setGlobalItemArrays,
  setGlobalSentences,
  curIndex,
  sentences,
  itemArrays,
  originText,
  remakeSentences,
}) {
  const remakeSentence = (stc) => remakeSentences([stc])[0];

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const move = (source, destination, src, dest) => {
    const sourceClone = [...source];
    const destClone = [...destination];
    const [removed] = sourceClone.splice(src.index, 1);
    destClone.splice(dest.index, 0, removed);
    return {
      [src.droppableId]: sourceClone,
      [dest.droppableId]: destClone,
    };
  };

  const onDragEnd = ({ source, destination }) => {
    if (!destination) return;

    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;
    const newChunks = [...sentences[curIndex].chunks];

    if (sInd === dInd) {
      newChunks[sInd].source = reorder(
        newChunks[sInd].source,
        source.index,
        destination.index,
      );
    } else {
      const res = move(
        newChunks[sInd].source,
        newChunks[dInd].source,
        source,
        destination,
      );
      newChunks[sInd].source = res[sInd];
      newChunks[dInd].source = res[dInd];
      newChunks[sInd].gloss = "";
      newChunks[dInd].gloss = "";
    }

    setGlobalSentences(
      curIndex,
      remakeSentence({
        originalSource: sentences[curIndex].originalSource,
        chunks: newChunks,
        sourceString: sentences[curIndex].sourceString,
      }),
    );
  };

  const glossChangeHandler = (e, n) => {
    const newItemArrays = [...itemArrays[curIndex]];
    const newChunks = [...sentences[curIndex].chunks];

    newItemArrays[n].gloss = e.target.value;
    newChunks[n].gloss = e.target.value;

    setGlobalItemArrays(curIndex, newItemArrays);
    setGlobalSentences(curIndex, {
      originalSource: sentences[curIndex].originalSource,
      chunks: newChunks,
      sourceString: sentences[curIndex].sourceString,
    });
  };
  const chunkUpHandler = (n) => {
    const newChunks = [...sentences[curIndex].chunks];
    [newChunks[n - 1], newChunks[n]] = [newChunks[n], newChunks[n - 1]];

    const newSentence = remakeSentence({
      originalSource: sentences[curIndex].originalSource,
      chunks: newChunks,
      sourceString: sentences[curIndex].sourceString,
    });
    setGlobalSentences(curIndex, newSentence);
  };

  const chunkDownHandler = (n) => {
    const newChunks = [...sentences[curIndex].chunks];
    [newChunks[n], newChunks[n + 1]] = [newChunks[n + 1], newChunks[n]];

    const newSentence = remakeSentence({
      originalSource: sentences[curIndex].originalSource,
      chunks: newChunks,
      sourceString: sentences[curIndex].sourceString,
    });
    setGlobalSentences(curIndex, newSentence);
  };
  return (
    <Box display="flex" flexDirection="column">
      <Box flex={1} overflow="auto" p={2}>
            <DragDropContext onDragEnd={onDragEnd}>
              {itemArrays[curIndex]?.map((items, n) => (
                <Grid container key={n}>
                  <Grid item sm={6} px={2} py={1}>
                    <Stack direction="row">
                      <Stack justifyContent="center">
                        <Button onClick={() => chunkUpHandler(n)} disabled={!n}>
                          <ArrowDropUp />
                        </Button>
                        <Button
                          onClick={() => chunkDownHandler(n)}
                          disabled={n === itemArrays[curIndex].length - 1}
                        >
                          <ArrowDropDown />
                        </Button>
                      </Stack>

                      <StrictModeDroppable
                        droppableId={`${n}`}
                        direction="horizontal"
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            style={getListStyle(snapshot.isDraggingOver)}
                          >
                            {items.chunk.map((item, index) => (
                              <Draggable
                                key={item.id}
                                draggableId={item.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={getItemStyle(
                                      snapshot.isDragging,
                                      provided.draggableProps.style,
                                    )}
                                  >
                                    <Stack direction="row" gap={1}>
                                      <Box>{item.content}</Box>
                                      {item.index ? (
                                        <Box fontSize={10}>
                                          {item.index + 1}
                                        </Box>
                                      ) : null}
                                    </Stack>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </StrictModeDroppable>
                    </Stack>
                  </Grid>

                  <Grid item sm={6} px={2} py={1}>
                    <MarkdownInput
                      value={items.gloss}
                      onChange={(e) => glossChangeHandler(e, n)}
                    />
                  </Grid>
                </Grid>
              ))}
            </DragDropContext>
      </Box>
    </Box>
  );
}

export default JuxtaEditable;
