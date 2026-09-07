import React, { useContext } from "react";
import TextTranslationEditorMuncher from "../../munchers/TextTranslation/TextTranslationEditorMuncher";
import TextTranslationViewerMuncher from "../../munchers/TextTranslation/TextTranslationViewerMuncher";
import BcvAudioTranslationViewerMuncher from "../../munchers/BcvAudio/BcvAudioViewerMuncher";
import {
  AudioTranslationEditorMuncher,
  AudioTranslationViewerMuncher,
} from "pankosmia-audio_translation-muncher";
import {
  BcvNotesViewerMuncher,
  BcvNotesEditorMuncher,
  BcvQuestionsViewerMuncher,
} from "pankosmia-bcv-muncher";

import BcvArticlesViewerMuncher from "../../munchers/BcvArticles/BcvArticlesViewerMuncher";
import BcvImagesViewerMuncher from "../../munchers/BcvImages/BcvImagesViewerMuncher";
import BcvVideosViewerMuncher from "../../munchers/BcvVideos/BcvVideosViewerMuncher";
import TastelessMuncher from "../../munchers/Tasteless/TastelessMuncher";
import "./tiles_styles.css";
import VideoLinksViewerMuncher from "../../munchers/VideoLinks/VideoLinksViewerMuncher";
import BNotesViewerMuncher from "../../munchers/BNotes/BNotesViewerMuncher";

import { OBSViewerMuncher, OBSEditorMuncher } from "pankosmia-obs-muncher";

import OBSNotesViewerMuncher from "../../munchers/OBSNotes/OBSNotesViewerMuncher";

import OBSQuestionsViewerMuncher from "../../munchers/OBSQuestions/OBSQuestionsViewerMuncher";
import OBSArticlesViewerMuncher from "../../munchers/OBSArticles/OBSArticlesViewerMuncher";
import JuxtalinearEditorMuncher from "../../munchers/Juxtalinear/JuxtalinearEditorMuncher";

import { TranslationPlanViewerMuncher } from "pankosmia-translation_plan-muncher";
import { JuxtalinearViewerMuncher } from "pankosmia-juxta-muncher";
import OBSContext from "../../contexts/obsContext";
import {
  currentProjectContext,
  bcvContext,
  debugContext,
  i18nContext,
  typographyContext,
} from "pankosmia-rcl";
function WorkspaceCard({ metadata, style, distractionModeCount }) {
  const { bcvRef } = useContext(bcvContext);
  const { systemBcv } = useContext(bcvContext);
  const { debugRef } = useContext(debugContext);
  const { i18nRef } = useContext(i18nContext);
  const { typographyRef } = useContext(typographyContext);
  const { currentProjectRef } = useContext(currentProjectContext);
  const { obs, setObs } = useContext(OBSContext);

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
            'url("/api/app-resources/pages/workspace/tile_blur.png")',
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
        <TextTranslationEditorMuncher metadata={metadata} />
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
  if (metadata.primary && metadata.flavor === "audioTranslation") {
    return (
      <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        <AudioTranslationEditorMuncher
          metadata={metadata}
          debugRef={debugRef}
          i18nRef={i18nRef}
        />
      </div>
    );
  }
  // This component is using TW fonts and lineHeight, though also does not currently display translated words.
  if (metadata.flavor === "audioTranslation") {
    return (
      <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        <AudioTranslationViewerMuncher
          metadata={metadata}
          debugRef={debugRef}
          i18nRef={i18nRef}
          systemBcv={systemBcv}
        />
      </div>
    );
  }
  // This component has TW and MUI lineHeights and fonts interfering!
  if (metadata.primary && metadata.flavor.toLowerCase() === "x-bcvnotes") {
    return (
      <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        {systemBcv?.bookCode && (
          <BcvNotesEditorMuncher
            metadata={metadata}
            debugRef={debugRef}
            i18nRef={i18nRef}
            systemBcv={systemBcv}
            bcvRef={bcvRef}
            currentProjectRef={currentProjectRef}
          />
        )}
      </div>
    );
  }
  // Override tailwind with lineHeight: 'normal' to support Awami Nastaliq
  if (metadata.flavor.toLowerCase() === "x-bcvnotes") {
    return (
      <div
        style={{ ...style, lineHeight: "normal" }}
        dir={sbScriptDirSet ? sbScriptDir : undefined}
      >
        <BcvNotesViewerMuncher
          metadata={metadata}
          debugRef={debugRef}
          i18nRef={i18nRef}
          systemBcv={systemBcv}
        />
      </div>
    );
  }
  // Override tailwind with lineHeight: 'normal' to support Awami Nastaliq
  if (metadata.flavor.toLowerCase() === "x-bnotes") {
    return (
      <div
        style={{ ...style, lineHeight: "normal" }}
        dir={sbScriptDirSet ? sbScriptDir : undefined}
      >
        <BNotesViewerMuncher metadata={metadata} />
      </div>
    );
  }
  // This component has TW and MUI lineHeights and fonts interfering!
  if (metadata.primary && metadata.flavor.toLowerCase() === "x-juxtalinear") {
    return (
      <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        <JuxtalinearEditorMuncher
          metadata={metadata}
          bcvRef={bcvRef}
          debugRef={debugRef}
          i18nRef={i18nRef}
          currentProjectRef={currentProjectRef}
        />
      </div>
    );
  }
  // Override tailwind with lineHeight: 'normal' to support Awami Nastaliq
  if (metadata.flavor.toLowerCase() === "x-juxtalinear") {
    return (
      <div
        style={{ ...style, lineHeight: "normal" }}
        dir={sbScriptDirSet ? sbScriptDir : undefined}
      >
        <JuxtalinearViewerMuncher
          metadata={metadata}
          bcvRef={bcvRef}
          debugRef={debugRef}
          i18nRef={i18nRef}
          currentProjectRef={currentProjectRef}
        />
      </div>
    );
  }
  // This component has TW and MUI lineHeights and fonts interfering!
  if (metadata.primary && metadata.flavor.toLowerCase() === "x-bcvquestions") {
    return (
      <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        <BcvNotesEditorMuncher
          metadata={metadata}
          debugRef={debugRef}
          i18nRef={i18nRef}
          systemBcv={systemBcv}
          bcvRef={bcvRef}
          currentProjectRef={currentProjectRef}
        />
      </div>
    );
  }
  // This component has TW and MUI lineHeights and fonts interfering!
  if (metadata.flavor.toLowerCase() === "x-bcvquestions") {
    return (
      <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        {systemBcv?.bookCode && (
          <BcvQuestionsViewerMuncher
            metadata={metadata}
            debugRef={debugRef}
            bcvRef={bcvRef}
            i18nRef={i18nRef}
            systemBcv={systemBcv}
          />
        )}
      </div>
    );
  }
  // This component has TW and MUI lineHeights and fonts interfering!
  if (metadata.flavor.toLowerCase() === "x-bcvarticles") {
    return (
      <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        <BcvArticlesViewerMuncher metadata={metadata} />
      </div>
    );
  }
  // This component is built with TW classes with line heights interfering with AwamiNastliq's need for normal if/when caption translations become available.
  if (metadata.flavor.toLowerCase() === "x-bcvimages") {
    return (
      <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        <BcvImagesViewerMuncher metadata={metadata} />
      </div>
    );
  }
  // Override tailwind with lineHeight: 'normal' to support Awami Nastaliq
  if (metadata.flavor === "x-videolinks") {
    return (
      <div
        style={{ ...style, lineHeight: "normal" }}
        dir={sbScriptDirSet ? sbScriptDir : undefined}
      >
        <VideoLinksViewerMuncher metadata={metadata} />
      </div>
    );
  }
  // This component has TW and MUI lineHeights and fonts interfering!
  if (metadata.primary && metadata.flavor === "textStories") {
    return (
      <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        <OBSEditorMuncher
          metadata={metadata}
          debugRef={debugRef}
          i18nRef={i18nRef}
          obs={obs}
          setObs={setObs}
        />
      </div>
    );
  }
  // Override tailwind with lineHeight: 'normal' to support Awami Nastaliq
  if (metadata.flavor === "textStories") {
    return (
      <div
        style={{ ...style, lineHeight: "normal" }}
        dir={sbScriptDirSet ? sbScriptDir : undefined}
      >
        <OBSViewerMuncher
          metadata={metadata}
          bcvRef={bcvRef}
          debugRef={debugRef}
          i18nRef={i18nRef}
          obs={obs}
          setObs={setObs}
        />
      </div>
    );
  }
  // This component has TW and MUI lineHeights and fonts interfering!
  if (metadata.flavor.toLowerCase() === "x-obsquestions") {
    return (
      <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        <OBSQuestionsViewerMuncher metadata={metadata} />
      </div>
    );
  }
  // Override tailwind with lineHeight: 'normal' to support Awami Nastaliq
  if (metadata.flavor.toLowerCase() === "x-obsnotes") {
    return (
      <div
        style={{ ...style, lineHeight: "normal" }}
        dir={sbScriptDirSet ? sbScriptDir : undefined}
      >
        <OBSNotesViewerMuncher metadata={metadata} />
      </div>
    );
  }
  // This component has TW and MUI lineHeights and fonts interfering!
  if (metadata.flavor.toLowerCase() === "x-obsarticles") {
    return (
      <div style={style} dir={sbScriptDirSet ? sbScriptDir : undefined}>
        <OBSArticlesViewerMuncher metadata={metadata} />
      </div>
    );
  }
  // This component is built with TW classes with line heights interfering with AwamiNastliq's need for Normal if/when useful videos with translated captions become available.
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
        <TranslationPlanViewerMuncher
          metadata={metadata}
          systemBcv={systemBcv}
          debugRef={debugRef}
          i18nRef={i18nRef}
          typographyRef={typographyRef}
        />
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
