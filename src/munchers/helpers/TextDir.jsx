import { useDetectDir } from "font-detect-rhl";

/**
  Character ratioThreshold = RTL : (LTR + RTL)
    - Default: 0.3

  HTML:
    - Comprehensive markup regex exclusion is applied excluding html code, in addition to neutral direction characters
      - Thus a higher ratioThreshold is utilized

  Text (with no markup):
    - No regex exclusion is applied aside from neutral direction characters
    - Precise identification of text direction excluding neutral direction characters
      - Thus a higher ratioThreshold is utilized.

  USFM / MD:
    - Markup regex exclusion is applied, in addition to neutral direction characters
    - A lower ratioThreshold allows for the possibility that some LTR markup text could be missed by markup regex exclusion.

  Unspecified text:
    - No regex exclusion is applied.
    - A lower ratioThreshold allows for the possibility that unspecified text type could contain some LTR markup character that should be excluded from consideration.
*/
function TextDir(content, type) {
    
    const htmlMarkupScope = {
      regex: [/<[^>]+>/gm], // Remove all html code
    };
    
    const mdMarkupScope = {
      regex: [/^#{1,}|((?<=.[\r?\n|\r])^)={1,}|^ *>{1,}( >)* #*=*(\d+\.)*|^ *\d+\.|^ *\+|(_|\*|~|\|)|[\[|!\[]|(\.*?\]\((.*?)\))/gm], // headings | alternate heading | block quotes and inside headings and inside ordered lists | ordered lists | unordered + lists | bold, italics, strike, horizontal rules, tables (and any other occurrence of _, *, ~, or | (not capturing - as it is in neutralScope) | link/image
    };
    
    const useDetectDirHtmlProps = { text: content, ratioThreshold: 0.51, isMarkup: true, markupScope: htmlMarkupScope };
    const useDetectDirUsfmProps = { text: content, isMarkup: true }; // Default usfm markup regex is in use.
    const useDetectDirMdProps = { text: content, isMarkup: true, markupScope: mdMarkupScope  };
    const useDetectDirTextProps = { text: content, ratioThreshold: 0.51, isMarkup: false };
    const useDetectDirUnspecifiedType = { text: content, isMarkup: true };

    let useDetectDirProps;

    switch (type) {
      case 'html':
        useDetectDirProps = useDetectDirHtmlProps;
        break;
      case 'usfm':
        useDetectDirProps = useDetectDirUsfmProps;
        break;
      case 'md':
        useDetectDirProps = useDetectDirMdProps;
        break;
      case 'text':
        useDetectDirProps = useDetectDirTextProps;
        break;
      default:
        useDetectDirProps = useDetectDirUnspecifiedType;
    }
    const textDir = useDetectDir( useDetectDirProps );

    return textDir;
}

export default TextDir;