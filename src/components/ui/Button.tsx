import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "primary-soft"
    | "secondary"
    | "warning"
    | "danger"
    | "danger-ghost"
    | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "primary",
  size = "md",
  ...props
}) => {
  const baseClasses =
    "font-semibold rounded-md border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-logo-primary/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const variantClasses = {
    primary:
      "text-white bg-logo-primary border-logo-primary hover:bg-logo-primary/90 hover:border-logo-primary/90",
    "primary-soft":
      "text-logo-primary bg-logo-primary/10 border-logo-primary/20 hover:bg-logo-primary/20",
    secondary:
      "text-text bg-surface border-mid-gray/30 hover:bg-logo-primary/5 hover:border-logo-primary/50",
    warning:
      "text-text bg-surface border-mid-gray/30 hover:bg-warning/10 hover:border-warning",
    danger:
      "text-white bg-error border-error hover:bg-error/90 hover:border-error/90",
    "danger-ghost": "text-error border-transparent hover:bg-error/10",
    ghost:
      "text-text/80 border-transparent hover:bg-logo-primary/10 hover:text-text",
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-4 py-[5px] text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
