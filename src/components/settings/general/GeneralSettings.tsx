import React from "react";
import { useTranslation } from "react-i18next";
import { type } from "@tauri-apps/plugin-os";
import { MicrophoneSelector } from "../MicrophoneSelector";
import { ChannelSelector } from "../ChannelSelector";
import { ShortcutInput } from "../ShortcutInput";
import { SettingsGroup } from "../../ui/SettingsGroup";
import { OutputDeviceSelector } from "../OutputDeviceSelector";
import { ShortcutActivationSetting } from "../ShortcutActivation";
import { AudioFeedback } from "../AudioFeedback";
import { useSettings } from "../../../hooks/useSettings";
import { VolumeSlider } from "../VolumeSlider";
import { MuteWhileRecording } from "../MuteWhileRecording";
import { ModelSettingsCard } from "./ModelSettingsCard";
import { SettingsPageHeader } from "../../ui/SettingsPageHeader";
import { Layers3 } from "lucide-react";
import type { ModelInfo } from "@/bindings";
import { useModelStore } from "@/stores/modelStore";

interface GeneralSettingsProps {
  onNavigateModels?: () => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  onNavigateModels = () => {},
}) => {
  const { t } = useTranslation();
  const { audioFeedbackEnabled } = useSettings();
  const { currentModel, models } = useModelStore();
  const activeModel = models.find(
    (model: ModelInfo) => model.id === currentModel,
  );
  const isLinux = type() === "linux";
  return (
    <div className="settings-page max-w-3xl w-full mx-auto">
      <SettingsPageHeader
        title={t("settings.general.title")}
        subtitle={t("settings.general.description")}
      />
      <SettingsGroup title={t("settings.general.shortcut.title")}>
        <ShortcutInput shortcutId="transcribe" grouped={true} />
        <ShortcutActivationSetting descriptionMode="tooltip" grouped={true} />
        {/* Cancel shortcut remains hidden on Linux because of dynamic shortcut instability. */}
        {!isLinux && <ShortcutInput shortcutId="cancel" grouped={true} />}
      </SettingsGroup>
      {activeModel && (
        <SettingsGroup title={t("settings.general.model.title")}>
          <div className="settings-row model-summary-row">
            <span className="model-icon-tile" aria-hidden="true">
              <Layers3 />
            </span>
            <div className="model-summary-copy">
              <div className="model-summary-title">
                <strong>{activeModel.name}</strong>
                <span className="on-device-badge">
                  <i />
                  {t("settings.general.model.badge")}
                </span>
              </div>
              <p>{t("settings.general.model.description")}</p>
            </div>
            <button
              type="button"
              className="model-change-button"
              onClick={onNavigateModels}
            >
              {t("settings.general.model.change")}
            </button>
          </div>
        </SettingsGroup>
      )}
      <ModelSettingsCard />
      <SettingsGroup title={t("settings.sound.title")}>
        <MicrophoneSelector descriptionMode="tooltip" grouped={true} />
        <ChannelSelector descriptionMode="tooltip" grouped={true} />
        <MuteWhileRecording descriptionMode="tooltip" grouped={true} />
        <AudioFeedback descriptionMode="tooltip" grouped={true} />
        <OutputDeviceSelector
          descriptionMode="tooltip"
          grouped={true}
          disabled={!audioFeedbackEnabled}
        />
        <VolumeSlider disabled={!audioFeedbackEnabled} />
      </SettingsGroup>
    </div>
  );
};
