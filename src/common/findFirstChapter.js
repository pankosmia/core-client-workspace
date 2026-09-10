import { getJson, postEmptyJson, getText } from "pankosmia-lib/http";
export async function getFirstChapterTextTranslation(
  currentProjectRefCurr,
  debugRefCurr,
  bookCode,
) {
  const projectPath = `${currentProjectRefCurr.source}/${currentProjectRefCurr.organization}/${currentProjectRefCurr.project}`;
  const responce = await getText(
    `/api/burrito/ingredient/raw/${projectPath}?ipath=${bookCode}.usfm`,
  );
  if (responce.ok) {
    const usfmString = responce.text;
    const re = /\\c\s+(\d+)/;
    const match = usfmString.match(re);
    if (match) {
      const chapter = match[1];
      postEmptyJson(
        `/api/navigation/bcv/${bookCode}/${chapter}/1`,
        debugRefCurr,
      );
    }
  }
}
