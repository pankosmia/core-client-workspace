import { DialogContent, Grid2, Typography } from "@mui/material";
import { PanDialog } from "pankosmia-rcl";
import { doI18n, getJson, getAndSetJson } from "pithekos-lib";
import { useContext, useEffect, useState } from "react";
import { i18nContext, debugContext, bcvContext } from "pankosmia-rcl";

export default function DialogResources({
  open,
  close,
  resources,
  setResources,
}) {
  const { i18nRef } = useContext(i18nContext);
  const { debugRef } = useContext(debugContext);
  const { systemBcv } = useContext(bcvContext);

  const [summaries, setSummaries] = useState({});
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const getResourceOptions = async () => {
      getAndSetJson({
        url: "/burrito/metadata/summaries",
        setter: setSummaries,
        debug: debugRef.current,
      });
    };
    getResourceOptions().then();
  }, [debugRef]);

  useEffect(() => {
    const getLanguage = async () => {
      const gotLanguages = await getJson(
        "/settings/languages",
        debugRef.current,
      );
      setLanguage(gotLanguages.json[0]);
    };
    getLanguage().then();
  }, [debugRef, open]);

  useEffect(() => {
    const filteredRepos = Object.entries(summaries)
      .filter(
        ra => {
          return ra[1].language_code === language &&
          ra[1].book_codes.includes(systemBcv.bookCode)
  })
      .map((r) => {
        return { ...r[1], path: r[0] };
      });
    setResources({
      translations: filteredRepos.filter(
        (ro) => ro.flavor === "textTranslation",
      ),
      juxta: filteredRepos.filter((ro) => ro.flavor === "x-juxtalinear"),
      notes: filteredRepos.filter((ro) => ro.flavor === "x-bcvnotes"),
    });
  }, [summaries, setResources, systemBcv, language]);

  return (
    <PanDialog
      titleLabel={doI18n(
        "pages:core-local-workspace:resources_rhakos",
        i18nRef.current,
      )}
      isOpen={open}
      closeFn={() => close(false)}
    >
      <DialogContent>
        <Grid2 container spacing={2}>
          <Grid2
            size={12}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            choices go here
          </Grid2>
        </Grid2>
      </DialogContent>
    </PanDialog>
  );
}
