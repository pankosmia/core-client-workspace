import { getText, postEmptyJson } from "pankosmia-lib/http";

export async function getFirstverseTextTranslation(
  chapter,
  currentProjectRefCurr,
  debugRefCurr,
  bookCode,
) {
  const projectPath = `${currentProjectRefCurr.source}/${currentProjectRefCurr.organization}/${currentProjectRefCurr.project}`;

  const response = await getText(
    `/api/burrito/ingredient/raw/${projectPath}?ipath=${bookCode}.usfm`,
  );

  if (!response.ok) {
    throw new Error(
      `/api/burrito/ingredient/raw/${projectPath}?ipath=${bookCode}.usfm` +
        reponse.error,
    );
  }

  const usfmString = response.text;

  // Find the requested chapter.
  const chapterRegex = new RegExp(`\\\\c\\s+${chapter}\\b`);
  const chapterMatch = usfmString.match(chapterRegex);

  if (!chapterMatch || chapterMatch.index === undefined) {
    return;
  }

  // Get everything after the requested chapter.
  const afterChapter = usfmString.slice(
    chapterMatch.index + chapterMatch[0].length,
  );

  // Find the first verse after the chapter.
  const verseMatch = afterChapter.match(/\\v\s+(\d+)/);
  if (!verseMatch) {
    return;
  }

  const firstVerse = verseMatch[1];

  postEmptyJson(
    `/api/navigation/bcv/${bookCode}/${chapter}/${firstVerse}`,
    debugRefCurr,
  );
}
