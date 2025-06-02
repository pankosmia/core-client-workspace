import React from 'react';
import TextTranslationEditorMuncher from "../../munchers/TextTranslation/TextTranslationEditorMuncher";
import TextTranslationViewerMuncher from "../../munchers/TextTranslation/TextTranslationViewerMuncher";
import BcvNotesViewerMuncher from "../../munchers/BcvNotes/BcvNotesViewerMuncher";
import BcvQuestionsViewerMuncher from "../../munchers/BcvQuestions/BcvQuestionsViewerMuncher";
import BcvArticlesViewerMuncher from "../../munchers/BcvArticles/BcvArticlesViewerMuncher";
import BcvImagesViewerMuncher from "../../munchers/BcvImages/BcvImagesViewerMuncher";
import TastelessMuncher from "../../munchers/Tasteless/TastelessMuncher";
import './tiles_styles.css'
import VideoLinksViewerMuncher from "../../munchers/VideoLinks/VideoLinksViewerMuncher";
import BNotesViewerMuncher from "../../munchers/BNotes/BNotesViewerMuncher";

function WorkspaceCard({metadata, style}) {
    const scriptDirectionString =  metadata.script_direction === 'rtl' ? 'rtl' : 'ltr';
    if (metadata.primary && metadata.flavor === "textTranslation") {
        return <div style={style} dir={scriptDirectionString}>
          <TextTranslationEditorMuncher
            metadata={metadata}
          />
        </div>
    }
    if (metadata.flavor === "textTranslation") {
        return <div style={style} dir={scriptDirectionString}>
          <TextTranslationViewerMuncher
              metadata={metadata}
          />
        </div>
  }
    if (metadata.flavor.toLowerCase() === "x-bcvnotes") {
        return <div style={style} dir={scriptDirectionString}>
            <BcvNotesViewerMuncher
                metadata={metadata}
            />
        </div>
    }
    if (metadata.flavor.toLowerCase() === "x-bnotes") {
        return <div style={style} dir={scriptDirectionString}>
            <BNotesViewerMuncher
                metadata={metadata}
            />
        </div>
    }
    if (metadata.flavor.toLowerCase() === "x-bcvquestions") {
        return <div style={style} dir={scriptDirectionString}>
            <BcvQuestionsViewerMuncher
                metadata={metadata}
            />
        </div>
    }
    if (metadata.flavor.toLowerCase() === "x-bcvarticles") {
        return <div style={style} dir={scriptDirectionString}>
            <BcvArticlesViewerMuncher
                metadata={metadata}
            />
        </div>
    }
    /*
    if (metadata.flavor.toLowerCase() === "x-bcvimages") {
        return <div style={style} dir={scriptDirectionString}>
            <BcvImagesViewerMuncher
                metadata={metadata}
            />
        </div>
    }
     */
    if (metadata.flavor === "x-videolinks") {
        return <div style={style} dir={scriptDirectionString}>
          <VideoLinksViewerMuncher
              metadata={metadata}
          />
        </div>
    }
    // DO NOT REMOVE! Fallback so that an element is always returned
    return <div style={style} dir={scriptDirectionString}>
      <TastelessMuncher
          metadata={metadata}
      />
    </div>
}

export default WorkspaceCard;