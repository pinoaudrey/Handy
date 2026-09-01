import React from "react";
import ResetIcon from "../icons/ResetIcon";

interface ResetButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  children?: React.ReactNode;
}

export const ResetButton: React.FC<ResetButtonProps> = React.memo(
  ({ onClick, disabled = false, className = "", ariaLabel, children }) => (
    <button
      type="button"
      aria-label={ariaLabel}
      className={`p-1.5 rounded-md border border-transparent transition-colors duration-150 ${
        disabled
          ? "opacity-50 cursor-not-allowed text-text/40"
          : "text-mid-gray hover:text-logo-primary hover:bg-logo-primary/10 active:bg-logo-primary/20 hover:cursor-pointer"
      } ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children ?? <ResetIcon />}
    </button>
  ),
);
