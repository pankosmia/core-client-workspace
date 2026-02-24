import { Checkbox, DialogContent, Grid2 } from "@mui/material";
import LlmModelPicker from "./LlmModelPicker";
import NumberPicker from "./NumberPicker";
import { PanDialog } from "pankosmia-rcl";
import { doI18n } from "pithekos-lib";
import { useContext } from "react";
import { i18nContext } from "pankosmia-rcl";

export default function DialogConfigRhakos({ open, close, models, selectedModel, setSelectedModel, topK, setTopK, temperature, setTemperature, showFullPrompt, setShowFullPrompt }) {
    const { i18nRef } = useContext(i18nContext);

    return (
        <PanDialog
            titleLabel={doI18n("pages:core-local-workspace:settings_rhakos", i18nRef.current)}
            isOpen={open}
            closeFn={() => close(false)}
        >
            <DialogContent>
                <Grid2 item size={2}>
                    {doI18n("pages:core-local-workspace:model_rhakos", i18nRef.current)}
                </Grid2>
                <Grid2 item size={10}>
                    <LlmModelPicker
                        models={models}
                        selectedModel={selectedModel}
                        setSelectedModel={setSelectedModel}
                    />
                </Grid2>
                <Grid2 item size={2}>
                    {doI18n("pages:core-local-workspace:show_prompt_rhakos", i18nRef.current)}
                </Grid2>
                <Grid2 item size={2}>
                    <Checkbox
                        checked={showFullPrompt}
                        onChange={() => setShowFullPrompt(!showFullPrompt)}
                        slotProps={{
                            input: { "aria-label": "controlled" },
                        }}
                    />
                </Grid2>
                <Grid2 item size={2}>
                    {doI18n("pages:core-local-workspace:topk_rhakos", i18nRef.current)}
                </Grid2>
                <Grid2 item size={2}>
                    <NumberPicker
                        state={topK}
                        setState={setTopK}
                        options={[1, 2, 5, 10, 20, 50, 100, 200, 500]}
                    />
                </Grid2>
                <Grid2 item size={2}>
                    {doI18n("pages:core-local-workspace:temperature_rhakos", i18nRef.current)}
                </Grid2>
                <Grid2 item size={2}>
                    <NumberPicker
                        state={temperature}
                        setState={setTemperature}
                        options={[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]}
                    />
                </Grid2>
            </DialogContent>
        </PanDialog>
    );
}