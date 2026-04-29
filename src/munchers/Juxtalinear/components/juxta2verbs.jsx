import { Box, Grid2, Typography } from "@mui/material";
import { doI18n } from "pithekos-lib";
import { useContext } from "react";
import { i18nContext as I18nContext, debugContext } from "pankosmia-rcl";

export default function Juxta2Verbs({ morphArray, lemma }) {
  const { i18nRef } = useContext(I18nContext);
  const { debugRef } = useContext(debugContext);

  const morphLookup = [
    {
      I: "ind",
      P: "part",
      N: "inf",
      S: "subj",
      M: `${doI18n("pages:core-local-workspace:morphLookup_m_imper", i18nRef.current, debugRef.current)}`,
      O: "opt",
    },
    {
      A: "aor",
      P: `${doI18n("pages:core-local-workspace:morphLookup_p_pres", i18nRef.current, debugRef.current)}`,
      I: "impft",
      F: "fut",
      E: `${doI18n("pages:core-local-workspace:morphLookup_e_perf", i18nRef.current, debugRef.current)}`,
      L: `${doI18n("pages:core-local-workspace:morphLookup_l_ppf", i18nRef.current, debugRef.current)}`,
    },
    {
      A: "act",
      P: "pass",
      M: `${doI18n("pages:core-local-workspace:morphLookup_m_mid", i18nRef.current, debugRef.current)}`,
    },
    {
      1: "1",
      2: "2",
      3: "3",
    },
    {
      S: "s",
      P: "p",
    },
  ];

  let morphString = morphArray[2];
  const morphSummary = (morphArray) => {
    let retBits = [];
    if (!morphString || morphString.length === 0) {
      return "";
    }
    retBits.push(morphLookup[0][morphString.substring(0, 1)] || "?");
    retBits.push(morphLookup[1][morphString.substring(1, 2)] || "?");
    retBits.push(morphLookup[2][morphString.substring(2, 3)] || "?");
    if (morphString.length > 3) {
      retBits.push(
        morphLookup[3][morphString.substring(3, 4)] +
          (morphLookup[4][morphArray[4]] || "") || "?",
      );
    }
    return retBits.join(" ");
  };
  return (
    <Box sx={{ p: 2 }}>
      <Grid2 container>
        <Grid2 item size={12}>
          <Typography>{lemma}</Typography>
        </Grid2>
        <Grid2 item size={12}>
          {morphString && <Typography>{morphSummary(morphArray)}</Typography>}
        </Grid2>
      </Grid2>
    </Box>
  );
}
