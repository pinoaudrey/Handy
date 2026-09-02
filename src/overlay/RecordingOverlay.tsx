import { listen } from "@tauri-apps/api/event";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "./RecordingOverlay.css";
import { commands, events } from "@/bindings";
import type {
  StreamPhase,
  StreamPhaseEvent,
  StreamTextEvent,
} from "@/bindings";
import i18n, { syncLanguageFromSettings } from "@/i18n";
import { formatShortcutCompact } from "@/lib/utils/keyboard";
import { getLanguageDirection } from "@/lib/utils/rtl";

type OverlayState =
  | "idle"
  | "recording"
  | "streaming"
  | "transcribing"
  | "processing";

const WAVE_BARS = 9;

const MicrophoneGlyph = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
  </svg>
);

const RecordingOverlay: React.FC = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [state, setState] = useState<OverlayState>("recording");
  const [hotkey, setHotkey] = useState("");
  const [captureReady, setCaptureReady] = useState(false);
  const [levels, setLevels] = useState<number[]>(Array(WAVE_BARS).fill(0));
  const [streamText, setStreamText] = useState<StreamTextEvent>({
    committed: "",
    tentative: "",
  });
  const [phase, setPhase] = useState<StreamPhase>("listening");
  const [elapsed, setElapsed] = useState(0);
  const [session, setSession] = useState(0);
  const [position, setPosition] = useState<"top" | "bottom">("bottom");
  const [overflowing, setOverflowing] = useState(false);

  const smoothedLevelsRef = useRef<number[]>(Array(16).fill(0));
  const capRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true);
  const direction = getLanguageDirection(i18n.language);

  useEffect(() => {
    const setupEventListeners = async () => {
      const unlistenShow = await listen("show-overlay", async (event) => {
        const overlayState = event.payload as OverlayState;
        if (overlayState === "recording" || overlayState === "streaming") {
          setCaptureReady(false);
          smoothedLevelsRef.current = Array(16).fill(0);
          setLevels(Array(WAVE_BARS).fill(0));
          setStreamText({ committed: "", tentative: "" });
        }

        await syncLanguageFromSettings();
        try {
          const settings = await commands.getAppSettings();
          if (settings.status === "ok") {
            setPosition(
              settings.data.overlay_position === "top" ? "top" : "bottom",
            );
            const binding =
              settings.data.bindings?.["transcribe"]?.current_binding;
            setHotkey(binding ? formatShortcutCompact(binding) : "");
          }
        } catch {
          // Keep the prior placement and shortcut if settings are unavailable.
        }

        setState(overlayState);
        if (overlayState === "streaming") {
          setPhase("listening");
          setElapsed(0);
          setSession((current) => current + 1);
        }
        setIsVisible(true);
      });

      const unlistenHide = await listen("hide-overlay", () => {
        setIsVisible(false);
        setCaptureReady(false);
      });

      const unlistenReady = await listen("recording-ready", () => {
        setElapsed(0);
        setCaptureReady(true);
      });

      const unlistenLevel = await listen<number[]>("mic-level", (event) => {
        const smoothed = smoothedLevelsRef.current.map((previous, index) => {
          const target = event.payload[index] || 0;
          return previous * 0.7 + target * 0.3;
        });
        smoothedLevelsRef.current = smoothed;
        setLevels(smoothed.slice(0, WAVE_BARS));
      });

      const unlistenStream = await events.streamTextEvent.listen((event) => {
        setStreamText(event.payload);
      });

      const unlistenPhase = await events.streamPhaseEvent.listen((event) => {
        const payload: StreamPhaseEvent = event.payload;
        setPhase(payload.phase);
      });

      return () => {
        unlistenShow();
        unlistenHide();
        unlistenReady();
        unlistenLevel();
        unlistenStream();
        unlistenPhase();
      };
    };

    const cleanup = setupEventListeners();
    return () => {
      cleanup.then((unlisten) => unlisten());
    };
  }, []);

  useEffect(() => {
    if (state !== "streaming" || !isVisible || !captureReady) return;

    const interval = setInterval(
      () => setElapsed((current) => current + 1),
      1000,
    );
    return () => clearInterval(interval);
  }, [state, isVisible, captureReady]);

  useLayoutEffect(() => {
    const element = capRef.current;
    if (!element) return;

    setOverflowing(element.scrollHeight > element.clientHeight + 1);
    if (pinnedRef.current) element.scrollTop = element.scrollHeight;
  }, [streamText]);

  useEffect(() => {
    pinnedRef.current = true;
    setOverflowing(false);
  }, [session]);

  const handleStreamScroll = () => {
    const element = capRef.current;
    if (!element) return;
    pinnedRef.current =
      element.scrollHeight - element.scrollTop - element.clientHeight <= 16;
  };

  const waveform = (
    <div
      className={`overlay-waveform ${captureReady ? "ready" : "arming"}`}
      aria-hidden="true"
    >
      {levels.map((level, index) => {
        const height = Math.max(3, Math.min(18, 3 + Math.pow(level, 0.7) * 15));
        const backgroundColor =
          height >= 11 ? "#FFFFFF" : index % 2 ? "#9CC0F7" : "#CFE0FB";
        return (
          <i key={index} style={{ height: `${height}px`, backgroundColor }} />
        );
      })}
    </div>
  );

  const cancelButton = (
    <button
      type="button"
      className="overlay-cancel"
      aria-label={t("common.cancel")}
      onClick={() => commands.cancelOperation()}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M4 4 L12 12 M12 4 L4 12"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );

  const formatElapsed = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  const renderListeningRow = (showTimer = false) => (
    <div className="overlay-control-row listening">
      <span className="overlay-leading">
        <MicrophoneGlyph />
      </span>
      {waveform}
      <strong>{t("overlay.listening")}</strong>
      {showTimer && (
        <span className="overlay-timer">{formatElapsed(elapsed)}</span>
      )}
      {cancelButton}
    </div>
  );

  const insertingRow = (
    <div className="overlay-control-row inserting">
      <span className="overlay-leading">
        <span className="overlay-spinner" />
      </span>
      <strong>{t("overlay.inserting")}</strong>
      {cancelButton}
    </div>
  );

  if (state === "idle") {
    return (
      <div className={`overlay-stage ${position}`}>
        <div className="overlay-pill idle">
          <span className="overlay-leading">
            <MicrophoneGlyph />
          </span>
          <strong>{t("overlay.dictate")}</strong>
          {hotkey && <span className="overlay-hotkey">{hotkey}</span>}
        </div>
      </div>
    );
  }

  if (!isVisible) return null;

  if (state === "streaming") {
    const hasText = Boolean(streamText.committed || streamText.tentative);
    const working = phase === "working";

    return (
      <div dir={direction} className={`overlay-stage ${position}`}>
        <div
          key={session}
          className={`overlay-card ${hasText ? "open" : "collapsed"} ${
            working ? "working" : "listening"
          }`}
        >
          <div className="overlay-transcript">
            <div
              className={`overlay-transcript-scroll ${
                overflowing ? "overflowing" : ""
              }`}
              ref={capRef}
              onScroll={handleStreamScroll}
            >
              <p>
                <span className="committed">
                  {streamText.committed ? `${streamText.committed} ` : ""}
                </span>
                <span className="tentative">{streamText.tentative}</span>
                {!working && <span className="overlay-caret" />}
              </p>
            </div>
          </div>
          {working ? insertingRow : renderListeningRow(hasText)}
        </div>
      </div>
    );
  }

  const working = state === "transcribing" || state === "processing";
  return (
    <div dir={direction} className={`overlay-stage ${position}`}>
      <div className={`overlay-pill ${working ? "inserting" : "listening"}`}>
        {working ? insertingRow : renderListeningRow()}
      </div>
    </div>
  );
};

export default RecordingOverlay;
