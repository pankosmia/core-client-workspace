import {
  DialogContent,
  Grid2,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
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
      .filter((ra) => {
        return (
          ra[1].language_code === language &&
          ra[1].book_codes.includes(systemBcv.bookCode)
        );
      })
      .map((r) => {
        return { ...r[1], path: r[0] };
      });
    setResources({
      translations: filteredRepos
        .filter((ro) => ro.flavor === "textTranslation")
        .map((ro) => [ro, false]),
      juxtas: filteredRepos
        .filter((ro) => ro.flavor === "x-juxtalinear")
        .map((ro) => [ro, false]),
      notes: filteredRepos
        .filter((ro) => ro.flavor === "x-bcvnotes")
        .map((ro) => [ro, false]),
    });
  }, [summaries, setResources, systemBcv, language]);

  const toggleSelectedResource = (section, path) => {
    const newResources = Object.fromEntries(
      Object.entries(resources).map((sectR) =>
        sectR[0] !== section
          ? sectR
          : [
              sectR[0],
              sectR[1].map((resR) => [
                resR[0],
                resR[0].path !== path ? resR[1] : !resR[1],
              ]),
            ],
      ),
    );
    setResources(newResources);
  };

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
          {["translations", "juxtas", "notes"].map(
            (s) =>
              resources[s].length > 0 && (
                <>
                  <Grid2 item size={12}>
                    <Typography variant="h6">
                      {doI18n(
                        `pages:core-local-workspace:${s}`,
                        i18nRef.current,
                      )}
                    </Typography>
                    <FormGroup>
                      {resources[s].map((t, n) => (
                        <FormControlLabel
                          key={n}
                          control={
                            <Checkbox
                              checked={t[1]}
                              onChange={() =>
                                toggleSelectedResource(s, t[0].path)
                              }
                            />
                          }
                          label={`${t[0].name} (${t[0].path})`}
                        />
                      ))}
                    </FormGroup>
                  </Grid2>
                </>
              ),
          )}
        </Grid2>
      </DialogContent>
    </PanDialog>
  );
}
