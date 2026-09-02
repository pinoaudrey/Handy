import React from "react";

interface SettingsPageHeaderProps {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}

export const SettingsPageHeader: React.FC<SettingsPageHeaderProps> = ({
  title,
  subtitle,
  action,
}) => (
  <header className="settings-page-header">
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
    {action}
  </header>
);
