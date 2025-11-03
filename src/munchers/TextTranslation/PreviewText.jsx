import { SofriaRenderFromProskomma, render } from "proskomma-json-tools";
import { Proskomma } from 'proskomma-core';
import { getText, debugContext, i18nContext, doI18n, getJson, typographyContext } from "pithekos-lib";
import { enqueueSnackbar } from "notistack";
import { useContext, useEffect, useRef, useState } from "react";
import GraphiteTest from "./GraphiteTest";
import { useAssumeGraphite } from "font-detect-rhl";
function PreviewText({ open, closeModal, metadata, systemBcv }) {
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
    const isFirefox = useAssumeGraphite({});

    useEffect(() => {
        if (open) {
            generatePdf(fileExport.current);
        }
    }, [open]);

    const isGraphite = GraphiteTest()
    /** adjSelectedFontClass reshapes selectedFontClass if Graphite is absent. */
    const adjSelectedFontClass = isGraphite ? typographyRef.current.font_set : typographyRef.current.font_set.replace(/Pankosmia-AwamiNastaliq(.*)Pankosmia-NotoNastaliqUrdu/ig, 'Pankosmia-NotoNastaliqUrdu');
    const generatePdf = async (bookCode) => {
        let pdfHtml;
        if (metadata) {
            const pdfTemplate = `<section style="page-break-inside: avoid"> %%BODY%% </section>`;
            const bookUrl = `/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.usfm`;
            const bookUsfmResponse = await getText(bookUrl, debugRef.current);
            if (!bookUsfmResponse.ok) {
                enqueueSnackbar(
                    `${doI18n("pages:content:could_not_fetch", i18nRef.current)} ${bookCode}`,
                    { variant: "error" }
                );
                return false;
            }
            const sectionConfig = {
                "showWordAtts": false,
                "showTitles": showTitles,
                "showHeadings": showHeadings,
                "showIntroductions": showIntroductions,
                "showFootnotes": showFootnotes,
                "showXrefs": showXrefs,
                "showParaStyles": showParaStyles,
                "showCharacterMarkup": showCharacterMarkup,
                "showChapterLabels": showChapterLabels,
                "showVersesLabels": showVersesLabels,
                "showFirstVerseLabel": showFirstVerseLabel,
                "nColumns": selectedColumns,
                "showGlossaryStar": false
            }
            const pk = new Proskomma();
            pk.importDocument({
                lang: "xxx",
                abbr: "yyy"
            },
                "usfm",
                bookUsfmResponse.text
            );
            const docId = pk.gqlQuerySync('{documents { id } }').data.documents[0].id;
            const actions = render.sofria2web.renderActions.sofria2WebActions;
            const renderers = render.sofria2web.sofria2html.renderers;
            const cl = new SofriaRenderFromProskomma({ proskomma: pk, actions, debugLevel: 0 })
            const output = {};
            sectionConfig.selectedBcvNotes = ["foo"];
            sectionConfig.renderers = renderers;
            sectionConfig.renderers.verses_label = vn => {
                return `<span class="marks_verses_label">${vn}</span>`;
            };
            cl.renderDocument({ docId, config: sectionConfig, output });
            pdfHtml = pdfTemplate.replace("%%BODY%%", output.paras);

        }
        const newPage = isFirefox ? window.open("", "_self") : window.open('about:blank', '_blank');
        const server = window.location.origin;
        if (!isFirefox) newPage.document.body.innerHTML = `<div class="${adjSelectedFontClass}">${pdfHtml}</div>`
        isFirefox && newPage.document.write(`<div class="${adjSelectedFontClass}">${pdfHtml}</div>`);
        newPage.document.head.innerHTML = '<title>Preview Note </title>'
        const script = document.createElement('script')
        script.src = `${server}/app-resources/pdf/paged.polyfill.js`;
        newPage.document.head.appendChild(script)
        const fontSetLink = document.createElement('link');
        fontSetLink.rel = "stylesheet";
        fontSetLink.href = "/webfonts/_webfonts.css";
        newPage.document.head.appendChild(fontSetLink);
        const link = document.createElement('link');
        link.rel = "stylesheet";
        link.href = `${server}/app-resources/pdf/para_bible_page_styles.css`;
        newPage.document.head.appendChild(link)
        return true;
    }
}

export default PreviewText;