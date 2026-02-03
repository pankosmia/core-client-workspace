import React from "react";
import TextTranslationEditorMuncher from "../../munchers/TextTranslation/TextTranslationEditorMuncher";
import TextTranslationViewerMuncher from "../../munchers/TextTranslation/TextTranslationViewerMuncher";
import BcvAudioTranslationViewerMuncher from "../../munchers/BcvAudio/BcvAudioViewerMuncher";
import BcvNotesViewerMuncher from "../../munchers/BcvNotes/BcvNotesViewerMuncher";
import BcvNotesEditorMuncher from "../../munchers/BcvNotes/BcvNotesEditorMuncher";
import BcvQuestionsViewerMuncher from "../../munchers/BcvQuestions/BcvQuestionsViewerMuncher";
import BcvArticlesViewerMuncher from "../../munchers/BcvArticles/BcvArticlesViewerMuncher";
import BcvImagesViewerMuncher from "../../munchers/BcvImages/BcvImagesViewerMuncher";
import BcvVideosViewerMuncher from "../../munchers/BcvVideos/BcvVideosViewerMuncher";
import TastelessMuncher from "../../munchers/Tasteless/TastelessMuncher";
import "./tiles_styles.css";
import VideoLinksViewerMuncher from "../../munchers/VideoLinks/VideoLinksViewerMuncher";
import BNotesViewerMuncher from "../../munchers/BNotes/BNotesViewerMuncher";
import OBSViewerMuncher from "../../munchers/OBS/OBSViewerMuncher";
import OBSEditorMuncher from "../../munchers/OBS/OBSEditorMuncher";
import OBSNotesViewerMuncher from "../../munchers/OBSNotes/OBSNotesViewerMuncher";
import OBSQuestionsViewerMuncher from "../../munchers/OBSQuestions/OBSQuestionsViewerMuncher";
import OBSArticlesViewerMuncher from "../../munchers/OBSArticles/OBSArticlesViewerMuncher";
import JuxtalinearViewerMuncher from "../../munchers/Juxtalinear/JuxtalinearViewer";
import TranslationPlanViewerMuncher from "../../munchers/TranslationPlan/TranslationPlanViewerMuncher";
import JuxtalinearEditorMuncher from "../../munchers/Juxtalinear/JuxtalinearEditorMuncher";

function WorkspaceCard({
  metadata,
  style,
  distractionModeCount,
  locationState,
}) {
  const sbScriptDir = metadata?.script_direction
    ? metadata.script_direction.toLowerCase()
    : undefined;
  const sbScriptDirSet = sbScriptDir === "ltr" || sbScriptDir === "rtl";

  if (!metadata.primary && distractionModeCount % 2 > 0) {
    return (
      <div
        style={{
          ...style,
          backgroundImage:
            'url("/app-resources/pages/workspace/tile_blur.png")',
          filter: "blur(1px)",
        }}
        dir={sbScriptDirSet ? sbScriptDir : undefined}
      ></div>
    );
  }
  // Override tailwind with lineHeight: 'normal' to support Awami Nastaliq
  if (metadata.primary && metadata.flavor === "textTranslation") {
    return (
      <div
        style={{ ...style, lineHeight: "normal" }}
        dir={sbScriptDirSet ? sbScriptDir : undefined}
      >
        <TextTranslationEditorMuncher
          metadata={metadata}
          locationState={locationState}
        />
      </div>
    );
  }
  // Override tailwind with lineHeight: 'normal' to support Awami Nastaliq
  if (metadata.flavor === "textTranslation") {
    return (
      <div
        style={{ ...style, lineHeight: "normal" }}
        dir={sbScriptDirSet ? sbScriptDir : undefined}
      >
        <TextTranslationViewerMuncher metadata={metadata} />
      </div>
    );
  }
  if (metadata.flavor === "audioTranslation") {
    return (
      <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        <BcvAudioTranslationViewerMuncher metadata={metadata} />
      </div>
    );
  }
  if (metadata.primary && metadata.flavor.toLowerCase() === "x-bcvnotes") {
    return (
      <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        <BcvNotesEditorMuncher metadata={metadata} />
      </div>
    );
  }
  if (metadata.flavor.toLowerCase() === "x-bcvnotes") {
    return (
      <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        <BcvNotesViewerMuncher metadata={metadata} />
      </div>
    );
  }
  if (metadata.flavor.toLowerCase() === "x-bnotes") {
    return (
      <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        <BNotesViewerMuncher metadata={metadata} />
      </div>
    );
  }
  if (metadata.primary && metadata.flavor.toLowerCase() === "x-juxtalinear") {
    return (
      <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        <JuxtalinearEditorMuncher
          metadata={metadata}
          locationState={locationState}
        />
      </div>
    );
  }
  if (metadata.flavor.toLowerCase() === "x-juxtalinear") {
    return (
      <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        <JuxtalinearViewerMuncher metadata={metadata} />
      </div>
    );
  }
  if (metadata.primary && metadata.flavor.toLowerCase() === "x-bcvquestions") {
    return (
      <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        <BcvNotesEditorMuncher metadata={metadata} />
      </div>
    );
  }
  if (metadata.flavor.toLowerCase() === "x-bcvquestions") {
    return (
      <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        <BcvQuestionsViewerMuncher metadata={metadata} />
      </div>
    );
  }
  if (metadata.flavor.toLowerCase() === "x-bcvarticles") {
    return (
      <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        <BcvArticlesViewerMuncher metadata={metadata} />
      </div>
    );
  }
  if (metadata.flavor.toLowerCase() === "x-bcvimages") {
    return (
      <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        <BcvImagesViewerMuncher metadata={metadata} />
      </div>
    );
  }
  if (metadata.flavor === "x-videolinks") {
    return (
      <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        <VideoLinksViewerMuncher metadata={metadata} />
      </div>
    );
  }
  if (metadata.primary && metadata.flavor === "textStories") {
    return (
      <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        <OBSEditorMuncher metadata={metadata} />
      </div>
    );
  }
  if (metadata.flavor === "textStories") {
    return (
      <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        <OBSViewerMuncher metadata={metadata} />
      </div>
    );
  }
  if (metadata.flavor.toLowerCase() === "x-obsquestions") {
    return (
      <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        <OBSQuestionsViewerMuncher metadata={metadata} />
      </div>
    );
  }
  if (metadata.flavor.toLowerCase() === "x-obsnotes") {
    return (
      <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        <OBSNotesViewerMuncher metadata={metadata} />
      </div>
    );
  }
  if (metadata.flavor.toLowerCase() === "x-obsarticles") {
    return (
      <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        <OBSArticlesViewerMuncher metadata={metadata} />
      </div>
    );
  }
  if (metadata.flavor.toLowerCase() === "x-bcvvideo") {
    return (
      <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        <BcvVideosViewerMuncher metadata={metadata} />
      </div>
    );
  }
  // Override tailwind with lineHeight: 'normal' to support Awami Nastaliq
  if (metadata.flavor.toLowerCase() === "x-translationplan") {
    return (
      <div
        style={{ ...style, lineHeight: "normal" }}
        dir={sbScriptDirSet ? sbScriptDir : undefined}
      >
        <TranslationPlanViewerMuncher metadata={metadata} />
      </div>
    );
  }

  // DO NOT REMOVE! Fallback so that an element is always returned
  return (
    <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
      <TastelessMuncher metadata={metadata} />
    </div>
  );
}

export default WorkspaceCard;
