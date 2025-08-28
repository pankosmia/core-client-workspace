import { useScripturalComposerContext } from "@scriptural/react";
import { ScrollText } from "lucide-react";

import { useEffect, useState } from "react";
import ExpandIcon from '@mui/icons-material/Expand';
export function ButtonExpandNotes({ defaultState }) {
  const { editorRef } = useScripturalComposerContext();
  const [isActive, setIsActive] = useState(defaultState);

  const handleClick = () => {
    setIsActive((current) => !current);
  };

  useEffect(() => {
    if (isActive) {
      editorRef.current?.classList.add("expand-notes");
      return;
    }
    editorRef.current?.classList.remove("expand-notes");
  }, [isActive, editorRef]);

  return (
    <button
      onClick={handleClick}
      title={isActive ? "Fold All Notes" : "Unfold All Notes"}
      className={isActive ? "active" : ""}
    >
      <ExpandIcon size={20} />
    </button>
  );
}