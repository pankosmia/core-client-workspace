import { useScripturalComposerContext } from '@scriptural/react';
import {
  bcvContext as BcvContext,
  postEmptyJson
} from "pithekos-lib";
import React, { useContext, useEffect, useRef } from 'react'

export default function ReferenceSyncPlugin() {
  const { scriptureReference } = useScripturalComposerContext();
  const { bcvRef, ...otherState } = useContext(BcvContext);

  console.log('otherState', {otherState});
  
  const lastBcvRef = useRef(null);

  useEffect(() => {
    if (bcvRef.current) {
      lastBcvRef.current = bcvRef.current;
      console.log('bcvRef.current', bcvRef.current);
    }
  }, [bcvRef]);

  useEffect(() => {
    if (lastBcvRef.current) {
      console.log('scriptureReference', scriptureReference);
      postEmptyJson(`/navigation/bcv/${scriptureReference.book.toUpperCase()}/${scriptureReference.chapter}/${scriptureReference.verse}`);
    }
  }, [scriptureReference]);



  return null;
}
