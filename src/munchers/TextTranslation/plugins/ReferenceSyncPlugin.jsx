import { useScripturalComposerContext } from '@scriptural/react';
import {
  bcvContext as BcvContext,
  postEmptyJson,
} from "pithekos-lib";
import { useCallback, useContext, useEffect, useRef } from 'react'

export  function ReferenceSyncPlugin() {
  const {
    scriptureReference: editorBcv,
    setScriptureReference: setEditorBcv
  } = useScripturalComposerContext();

  //Using systemBcv state to react to changes in the system BCV reference
  const { systemBcv } = useContext(BcvContext);
  
  // Flags to prevent infinite update loops
  const isEditorUpdate = useRef(false);
  const isSystemUpdate = useRef(false);

  // For debugging - using useEffect to avoid excessive logging
  useEffect(() => {
    console.log("systemBcv", systemBcv);
    console.log("editorBcv", editorBcv);
  }, [systemBcv, editorBcv]);

  // Function to update the system BCV reference
  const setSystemBcv = useCallback(({book, chapter, verse}) => {
    if (book && chapter && verse) {
      isEditorUpdate.current = true;
      postEmptyJson(`/navigation/bcv/${book.toUpperCase()}/${chapter}/${verse}`);
    }
  }, []);

  // Compare if references are equivalent to avoid unnecessary updates
  const areReferencesEqual = useCallback((systemBcvData, editorBcvData) => {
    return systemBcvData && editorBcvData &&
      systemBcvData.bookCode === editorBcvData.book &&
      systemBcvData.chapterNum === parseInt(editorBcvData.chapter) &&
      systemBcvData.verseNum === parseInt(editorBcvData.verse);
  }, []);

  // System → SharedEditor sync
  useEffect(() => {
    if (systemBcv && !isEditorUpdate.current) {
      // Avoid unnecessary updates if references are already equivalent
      const mappedReference = {
        book: systemBcv.bookCode,
        chapter: systemBcv.chapterNum,
        verse: systemBcv.verseNum
      };
      
      if (!areReferencesEqual(systemBcv, editorBcv)) {
        isSystemUpdate.current = true;
        setEditorBcv(mappedReference);
      }
    }
    isEditorUpdate.current = false;
  }, [systemBcv, setEditorBcv, editorBcv, areReferencesEqual]);

  // SharedEditor → System sync
  useEffect(() => {
    if (!isSystemUpdate.current && editorBcv?.book) {
      setSystemBcv(editorBcv);
    }
    isSystemUpdate.current = false;
  }, [editorBcv, setSystemBcv]);

  return null;
}
