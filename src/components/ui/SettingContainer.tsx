import React, { useEffect, useRef, useState } from "react";
import { Tooltip } from "./Tooltip";

interface SettingContainerProps {
  title: string;
  description: string;
  children: React.ReactNode;
  descriptionMode?: "inline" | "tooltip";
  grouped?: boolean;
  layout?: "horizontal" | "stacked";
  disabled?: boolean;
  tooltipPosition?: "top" | "bottom";
}

export const SettingContainer: React.FC<SettingContainerProps> = ({
  title,
  description,
  children,
  descriptionMode = "tooltip",
  grouped = false,
  layout = "horizontal",
  disabled = false,
  tooltipPosition = "top",
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTargetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showTooltip) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!tooltipTargetRef.current?.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTooltip]);

  const rowClasses = grouped
    ? "settings-row"
    : "settings-row rounded-xl border border-mid-gray/20 bg-surface";

  const descriptionTooltip = (
    <div
      ref={tooltipTargetRef}
      className="setting-description-tooltip"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        type="button"
        className="setting-description-trigger"
        aria-label={`${title}: ${description}`}
        aria-expanded={showTooltip}
        onClick={() => setShowTooltip((visible) => !visible)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setShowTooltip(false);
        }}
      >
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
      {showTooltip && (
        <Tooltip targetRef={tooltipTargetRef} position={tooltipPosition}>
          <p className="text-sm text-center leading-relaxed">{description}</p>
        </Tooltip>
      )}
    </div>
  );

  const heading = (
    <div className={`setting-title-row ${disabled ? "opacity-50" : ""}`}>
      <h3>{title}</h3>
      {descriptionMode === "tooltip" && descriptionTooltip}
    </div>
  );

  if (layout === "stacked") {
    return (
      <div className={`${rowClasses} flex-col items-stretch`}>
        <div>
          {heading}
          {descriptionMode === "inline" && (
            <p className={disabled ? "opacity-50" : ""}>{description}</p>
          )}
        </div>
        <div className="w-full">{children}</div>
      </div>
    );
  }

  return (
    <div className={rowClasses}>
      <div className="min-w-0 flex-1">
        {heading}
        {descriptionMode === "inline" && (
          <p className={disabled ? "opacity-50" : ""}>{description}</p>
        )}
      </div>
      <div className="relative shrink-0">{children}</div>
    </div>
  );
};
