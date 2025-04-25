import { bcvContext, postEmptyJson } from "pithekos-lib";
import { useCallback, useContext, useMemo } from "react";

export function useAppReferenceHandler(initialReference) {
  const { systemBcv } = useContext(bcvContext);
  const reference = useMemo(() => {
    return {
      book: systemBcv.bookCode,
      chapter: systemBcv.chapterNum,
      verse: systemBcv.verseNum
    };
  }, [systemBcv]);
  const setReference = useCallback(({book, chapter, verse}) => {
    if (book && chapter && verse) {
      postEmptyJson(`/navigation/bcv/${book.toUpperCase()}/${chapter}/${verse}`);
    }
  }, []);

  const referenceHandler = useMemo(() => {
    // Create an adapter that implements ScriptureReferenceHandler
    const handlers = new Set();
    
    const adapter = {
      // Return the current reference from React state
      getReference: () => reference,
      
      // Update React state and notify subscribers
      setReference: (ref, source = 'app_state', metadata) => {
        // Skip if nothing changed
        if (ref?.book === reference.book && 
            ref?.chapter === reference.chapter && 
            ref?.verse === reference.verse) {
          return;
        }
        
        // If the change is from the app (not editor), update app state
        if (source !== 'react_state_update') {
          setReference(ref || { book: "TIT", chapter: 1, verse: 1 });
        }
        
        // Notify all subscribers
        const event = { reference: ref, source, metadata };
        handlers.forEach(handler => handler(event));
      },
      
      // Subscription system
      subscribe: (callback) => {
        handlers.add(callback);
        // Initial notification
        callback({ 
          reference, 
          source: 'initial_load',
          metadata: { origin: 'react_state' }
        });
        
        // Return unsubscribe function
        return () => {
          handlers.delete(callback);
        };
      }
    };
    
    return adapter;
  }, [reference, setReference]); // Re-create when reference changes
  
  // When setReference is called outside the handler
  const handleReferenceChange = useCallback((newRef) => {
    // Notify the handler (and thus the editors) with special source
    referenceHandler.setReference(newRef, 'react_state_update');
  }, [referenceHandler]);

  return { reference, handleReferenceChange, referenceHandler };
}
