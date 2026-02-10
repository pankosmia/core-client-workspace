import { SofriaRenderFromProskomma, render } from "proskomma-json-tools";
import { Proskomma } from "proskomma-core";
import { getText, doI18n, getJson } from "pithekos-lib";
import { debugContext, i18nContext, typographyContext } from "pankosmia-rcl";
import { enqueueSnackbar } from "notistack";
import { useContext, useEffect, useRef, useState } from "react";
import { useTheme } from "@mui/material";
import GraphiteTest from "./GraphiteTest";
import TextDir from "../../../helpers/TextDir";

function PreviewText({ open, setOpenModalPreviewText, metadata, systemBcv }) {
  const { i18nRef } = useContext(i18nContext);
  const { debugRef } = useContext(debugContext);
  const fileExport = useRef();
  const [showTitles, setShowTitles] = useState(true);
  const [showHeadings, setShowHeadings] = useState(true);
  const [showIntroductions, setShowIntroductions] = useState(true);
  const [showFootnotes, setShowFootnotes] = useState(false);
  const [showXrefs, setShowXrefs] = useState(false);
  const [showParaStyles, setShowParaStyles] = useState(true);
  const [showCharacterMarkup, setShowCharacterMarkup] = useState(true);
  const [showChapterLabels, setShowChapterLabels] = useState(true);
  const [showVersesLabels, setShowVersesLabels] = useState(true);
  const [showFirstVerseLabel, setShowFirstVerseLabel] = useState(true);
  const [selectedColumns, setSelectedColumns] = useState(2);

  const { typographyRef } = useContext(typographyContext);

  useEffect(() => {
    if (open) {
      generatePdf(fileExport.current);
    }
  }, [open]);

  const isGraphite = GraphiteTest();
  /** adjSelectedFontClass reshapes selectedFontClass if Graphite is absent. */
  const adjSelectedFontClass = isGraphite
    ? typographyRef.current.font_set
    : typographyRef.current.font_set.replace(
        /Pankosmia-AwamiNastaliq(.*)Pankosmia-NotoNastaliqUrdu/gi,
        "Pankosmia-NotoNastaliqUrdu",
      );

  // Eliminating _webfonts.css pdf load by getting computed font styles.
  const [adjSelectedFontFamilies, setAdjSelectedFontFamilies] = useState(null);
  useEffect(() => {
    const element = document.getElementById("fontWrapper");
    const computedStyles = window.getComputedStyle(element);
    setAdjSelectedFontFamilies(computedStyles.fontFamily);
  }, [adjSelectedFontClass]);

  const theme = useTheme(); // used for DOM preview print button style

  const generatePdf = async (bookCode) => {
    let pdfHtml;
    if (metadata) {
      const pdfTemplate = `<section style="page-break-inside: avoid"> %%BODY%% </section>`;
      const bookUrl = `/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.usfm`;
      const bookUsfmResponse = await getText(bookUrl, debugRef.current);
      if (!bookUsfmResponse.ok) {
        enqueueSnackbar(
          `${doI18n("pages:content:could_not_fetch", i18nRef.current)} ${bookCode}`,
          { variant: "error" },
        );
        return false;
      }
      const sectionConfig = {
        showWordAtts: false,
        showTitles: showTitles,
        showHeadings: showHeadings,
        showIntroductions: showIntroductions,
        showFootnotes: showFootnotes,
        showXrefs: showXrefs,
        showParaStyles: showParaStyles,
        showCharacterMarkup: showCharacterMarkup,
        showChapterLabels: showChapterLabels,
        showVersesLabels: showVersesLabels,
        showFirstVerseLabel: showFirstVerseLabel,
        nColumns: selectedColumns,
        showGlossaryStar: false,
      };
      const pk = new Proskomma();
      pk.importDocument(
        {
          lang: "xxx",
          abbr: "yyy",
        },
        "usfm",
        bookUsfmResponse.text,
      );
      const docId = pk.gqlQuerySync("{documents { id } }").data.documents[0].id;
      const actions = render.sofria2web.renderActions.sofria2WebActions;
      const renderers = render.sofria2web.sofria2html.renderers;
      const cl = new SofriaRenderFromProskomma({
        proskomma: pk,
        actions,
        debugLevel: 0,
      });
      const output = {};
      sectionConfig.selectedBcvNotes = ["foo"];
      sectionConfig.renderers = renderers;
      sectionConfig.renderers.verses_label = (vn) => {
        return `<span class="marks_verses_label">${vn}</span>`;
      };
      cl.renderDocument({ docId, config: sectionConfig, output });
      pdfHtml = pdfTemplate.replace("%%BODY%%", output.paras);
    }
    const textDir = await TextDir(pdfHtml, "html");

    const pdfType = "para";
    const cssFile = () => {
      if (pdfType === "para") {
        return textDir === "ltr"
          ? "/app-resources/pdf/para_bible_page_styles.css"
          : "/app-resources/pdf/para_bible_page_styles_rtl.css";
      } else {
        return textDir === "ltr"
          ? "/app-resources/pdf/bcv_bible_page_styles.css"
          : "/app-resources/pdf/bcv_bible_page_styles_rtl.css";
      }
    };

    // Extract names of font css files called by the font class
    const parts = adjSelectedFontClass
      .replace("fonts-", "")
      .split("Pankosmia-");
    const formatPart = (part) => {
      return part
        .replace(/([a-z])(?=[A-Z])/g, "$1_")
        .replace(/SILSR/g, "SIL_SR"); // Insert underscores between lowercase and uppercase letters and handle SILSR
    };
    const fontUrlFilenames = parts
      .map((part) => {
        const formattedPart = formatPart(part);
        return formattedPart ? `/webfonts/pankosmia-${formattedPart}.css` : "";
      })
      .filter(Boolean); // Remove empty values

    const adjSelectedFontFamiliesStr = adjSelectedFontFamilies.replace(
      /"/g,
      "'",
    );

    const openPagedPreviewForPdf = async () => {
      const server = window.location.origin;
      const dirAttr = textDir === "rtl" ? ' dir="rtl"' : "";
      const contentHtml = `
              <div id="content"${dirAttr} style="font-family: ${adjSelectedFontFamiliesStr};">
                  ${pdfHtml}
              </div>
              <div id="preview-print-host">
                  <button id="preview-print" type="button">${doI18n("pages:content:print", i18nRef.current) || "Print"}</button>
              </div>
              <script>
                  (function(){
                    // Get values passed in to previewWin
                    const getPreviewVal = (name, fallback) => {
                      try {
                        const v = window['__' + name];
                        if (v === undefined || v === null) return fallback;
                        const s = String(v).trim();
                        if (/^__\w+$/.test(s)) return fallback; // Catch absent and "__printButtonText"-like cases
                        return s;
                      } catch (e) { return fallback; }
                    };
                    const BUTTON_TEXT = getPreviewVal('printButtonText', 'Print');
                    const BTN_BG = getPreviewVal('printButtonBackgroundColor', '#1976d2');
                    const BTN_COLOR = getPreviewVal('printButtonColor', '#fff');

                    const win = window;
                    const doc = document;
                    const ID = 'preview-print';
                    const HOST_ID = 'preview-print-host';
                    const STYLE_ID = HOST_ID + '-print-style';
                    const SETUP_FLAG = '_preview_print_setup';

                    const clickHandler = (e) => {
                    e && e.preventDefault();
                    setTimeout(() => {
                      try {
                        if (typeof win.print === 'function') win.print();
                        else if (win.opener && !win.opener.closed) {
                          try { win.opener.postMessage({ type: 'print-request', options: { printBackground: true }, ts: Date.now() }, win.location.origin); } catch (err) {}
                        }
                      } catch (err) {}
                      }, 50);
                    };

                    // Ensure the @media print style exists
                    const ensurePrintHideStyle = () => {
                      if (doc.getElementById(STYLE_ID)) return;
                      const s = doc.createElement('style');
                      s.id = STYLE_ID;
                      s.textContent = '@media print { #preview-print { display: none !important; } }';
                      const host = doc.getElementById(HOST_ID);
                      if (host && host.appendChild) host.appendChild(s);
                      else if (doc.head && doc.head.appendChild) doc.head.appendChild(s);
                      else if (doc.body && doc.body.appendChild) doc.body.appendChild(s);
                      else doc.documentElement.appendChild(s);
                    };

                    // Dedupe helper: keep only one final button after PagedJS re-render
                    const dedupeButtons = () => {
                      const all = Array.from(doc.querySelectorAll('#' + ID));
                      if (all.length <= 1) return;
                      const host = doc.getElementById(HOST_ID);
                      let keeper = all.find(el => host && host.contains(el)) || all[0];
                      if (keeper) {
                        if (keeper._preview_click) keeper.removeEventListener('click', keeper._preview_click);
                        keeper._preview_click = clickHandler;
                        keeper.addEventListener('click', keeper._preview_click);
                        keeper.style.pointerEvents = 'auto';
                        if (host && keeper.parentNode !== host) host.appendChild(keeper);
                      }
                      all.forEach(el => {
                        if (el !== keeper) {
                          try { el.parentNode && el.parentNode.removeChild(el); } catch (e) {}
                        }
                      });
                    };

                    // Create/ensure host + button, attach handler and inline visuals
                    const ensureButtonExists = () => {
                      let host = doc.getElementById(HOST_ID);
                      if (!host) {
                        host = doc.createElement('div');
                        host.id = HOST_ID;
                        host.style.position = 'fixed';
                        host.style.top = '0';
                        host.style.left = '0';
                        host.style.width = '100%';
                        host.style.pointerEvents = 'none';
                        host.style.zIndex = '99999';
                        // If body not present yet, append to documentElement as fallback, observer will move it
                        (doc.body || doc.documentElement).appendChild(host);
                      }
                      ensurePrintHideStyle();

                      let btn = doc.getElementById(ID);
                      if (!btn) {
                        btn = doc.createElement('button');
                        btn.id = ID;
                        btn.type = 'button';
                        btn.textContent = BUTTON_TEXT;
                        btn.style.fontFamily = '"Roboto", "Helvetica", "Arial", sans-serif';
                        btn.style.backgroundColor = BTN_BG;
                        btn.style.color = BTN_COLOR;
                        btn.style.fontWeight = '500';
                        btn.style.fontSize = '0.875rem';
                        btn.style.letterSpacing = '0.02857em';
                        btn.style.lineHeight = '1.75';
                        btn.style.textTransform = 'uppercase';
                        btn.style.height = '34px';
                        btn.style.cursor = 'pointer';
                        btn.style.border = 'none';
                        btn.style.padding = '0px 8px';
                        btn.style.borderRadius = '17px';
                        btn.style.position = 'fixed';
                        btn.style.top = '8px';
                        btn.style.left = '50%';
                        btn.style.transform = 'translateX(-50%)';
                        btn.style.zIndex = '99999';
                        btn.style.pointerEvents = 'auto';

                        host.appendChild(btn);

                        if (btn._preview_click) btn.removeEventListener('click', btn._preview_click);
                        btn._preview_click = clickHandler;
                        btn.addEventListener('click', btn._preview_click);
                      } else {
                        if (btn._preview_click) btn.removeEventListener('click', btn._preview_click);
                        btn._preview_click = clickHandler;
                        btn.addEventListener('click', btn._preview_click);
                        btn.style.pointerEvents = 'auto';
                        if (host && btn.parentNode !== host) host.appendChild(btn);
                      }

                      dedupeButtons();
                      return btn;

                    };

                    // Ensure routine
                    const ensureAll = () => {
                      try {
                        if (doc[SETUP_FLAG]) return;
                        ensureButtonExists();
                        try { win.addEventListener('afterprint', () => { try { win.close(); } catch (e) {} }); } catch (e) {}
                        doc[SETUP_FLAG] = true;
                      } catch (e) {}
                    };

                    // MutationObserver to recreate missing pieces and dedupe duplicate from PagedJS re-render
                    const startObserver = () => {
                      const mo = new win.MutationObserver(() => {
                        if (!doc.getElementById(STYLE_ID)) ensurePrintHideStyle();
                        if (!doc.getElementById(HOST_ID) || !doc.getElementById(ID)) ensureButtonExists();
                        dedupeButtons();
                      });
                      mo.observe(doc.documentElement || doc, { childList: true, subtree: true });
                    };

                    ensureAll();
                    startObserver();
                    setTimeout(() => { ensureAll(); dedupeButtons(); }, 50);
                  })();
                </script>
          `;

      const openFn = (url) => window.open(url, "_blank");
      const previewWin = openFn("about:blank");
      if (!previewWin) return; // window.open failed or was blocked
      try {
        void previewWin.document; // attempt to read document property
      } catch (e) {
        return; // window currently inaccessible (e.g., not yet initialized or cross‑origin)
      }
      // Pass values to previewWin
      previewWin.__printButtonText = doI18n(
        "pages:core-local-workspace:print",
        i18nRef.current,
      );
      previewWin.__printButtonBackgroundColor = theme.palette.primary.main;
      previewWin.__printButtonColor = theme.palette.primary.contrastText;

      // Initial Content
      previewWin.document.open();
      previewWin.document.write(contentHtml);
      previewWin.document.close();

      // Ensure head exists
      if (!previewWin.document.head) {
        const head = previewWin.document.createElement("head");
        previewWin.document.documentElement.insertBefore(
          head,
          previewWin.document.documentElement.firstChild,
        );
      }

      // Set the page title.
      previewWin.document.title = doI18n(
        "pages:core-local-workspace:pdf_preview",
        i18nRef.current,
      );

      // Wait until document.body is present, retrying until body exists or timeout.
      const waitForBody = (win, timeout = 3000) => {
        return new Promise((resolve, reject) => {
          const start = Date.now();
          const check = () => {
            try {
              if (win.document && win.document.body) return resolve();
            } catch (e) {
              // Access may throw while the new window is not ready or is cross-origin; Retry until timeout.
            }
            if (Date.now() - start > timeout)
              return reject(new Error("preview body timeout"));
            setTimeout(check, 25);
          };
          check();
        });
      };
      await waitForBody(previewWin);

      // Append PagedJS
      const script = previewWin.document.createElement("script");
      script.src = `${server}/app-resources/pdf/paged.polyfill.js`;
      previewWin.document.head.appendChild(script);

      const loadStyles = (href) => {
        const link = previewWin.document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        previewWin.document.head.appendChild(link);
      };

      // Load styles
      loadStyles(`${server}${cssFile()}`);
      fontUrlFilenames.forEach(loadStyles);
    };

    openPagedPreviewForPdf();
    setOpenModalPreviewText(false);
    return true;
  };
}

export default PreviewText;
