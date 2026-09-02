import React from "react";
import SelectComponent from "react-select";
import CreatableSelect from "react-select/creatable";
import type {
  ActionMeta,
  Props as ReactSelectProps,
  SingleValue,
  StylesConfig,
} from "react-select";

export type SelectOption = {
  value: string;
  label: string;
  isDisabled?: boolean;
};

type BaseProps = {
  value: string | null;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  isClearable?: boolean;
  onChange: (value: string | null, action: ActionMeta<SelectOption>) => void;
  onBlur?: () => void;
  className?: string;
  formatCreateLabel?: (input: string) => string;
};

type CreatableProps = {
  isCreatable: true;
  onCreateOption: (value: string) => void;
};

type NonCreatableProps = {
  isCreatable?: false;
  onCreateOption?: never;
};

export type SelectProps = BaseProps & (CreatableProps | NonCreatableProps);

const baseBackground = "var(--cp-canvas)";
const focusBackground = "var(--cp-canvas)";
const neutralBorder = "var(--cp-border)";

const selectStyles: StylesConfig<SelectOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 36,
    borderRadius: 8,
    borderColor: state.isFocused ? "var(--color-logo-primary)" : neutralBorder,
    boxShadow: state.isFocused
      ? "0 0 0 3px color-mix(in srgb, var(--color-logo-primary) 25%, transparent)"
      : "none",
    backgroundColor: state.isFocused ? focusBackground : baseBackground,
    fontSize: "13px",
    color: "var(--color-text)",
    transition: "all 150ms ease",
    ":hover": {
      borderColor: "color-mix(in srgb, var(--color-mid-gray) 50%, transparent)",
      backgroundColor: baseBackground,
    },
  }),
  valueContainer: (base) => ({
    ...base,
    paddingInline: 12,
    paddingBlock: 7,
  }),
  input: (base) => ({
    ...base,
    color: "var(--color-text)",
  }),
  singleValue: (base) => ({
    ...base,
    color: "var(--color-text)",
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused
      ? "var(--color-logo-primary)"
      : "color-mix(in srgb, var(--color-mid-gray) 80%, transparent)",
    ":hover": {
      color: "var(--color-logo-primary)",
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "color-mix(in srgb, var(--color-mid-gray) 80%, transparent)",
    ":hover": {
      color: "var(--color-logo-primary)",
    },
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 30,
    backgroundColor: "var(--color-surface)",
    color: "var(--color-text)",
    border:
      "1px solid color-mix(in srgb, var(--color-mid-gray) 20%, transparent)",
    borderRadius: 8,
    boxShadow: "0 8px 24px rgb(0 0 0 / 10%)",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "color-mix(in srgb, var(--color-logo-primary) 10%, transparent)"
      : state.isFocused
        ? "color-mix(in srgb, var(--color-logo-primary) 6%, transparent)"
        : "transparent",
    color: state.isSelected ? "var(--color-logo-primary)" : "var(--color-text)",
    cursor: state.isDisabled ? "not-allowed" : base.cursor,
    opacity: state.isDisabled ? 0.5 : 1,
  }),
  placeholder: (base) => ({
    ...base,
    color: "color-mix(in srgb, var(--color-mid-gray) 70%, transparent)",
  }),
};

export const Select: React.FC<SelectProps> = React.memo(
  ({
    value,
    options,
    placeholder,
    disabled,
    isLoading,
    isClearable = true,
    onChange,
    onBlur,
    className = "",
    isCreatable,
    formatCreateLabel,
    onCreateOption,
  }) => {
    const selectValue = React.useMemo(() => {
      if (!value) return null;
      const existing = options.find((option) => option.value === value);
      if (existing) return existing;
      return { value, label: value, isDisabled: false };
    }, [value, options]);

    const handleChange = (
      option: SingleValue<SelectOption>,
      action: ActionMeta<SelectOption>,
    ) => {
      onChange(option?.value ?? null, action);
    };

    const sharedProps: Partial<ReactSelectProps<SelectOption, false>> = {
      className,
      classNamePrefix: "app-select",
      value: selectValue,
      options,
      onChange: handleChange,
      placeholder,
      isDisabled: disabled,
      isLoading,
      onBlur,
      isClearable,
      styles: selectStyles,
    };

    if (isCreatable) {
      return (
        <CreatableSelect<SelectOption, false>
          {...sharedProps}
          onCreateOption={onCreateOption}
          formatCreateLabel={formatCreateLabel}
        />
      );
    }

    return <SelectComponent<SelectOption, false> {...sharedProps} />;
  },
);

Select.displayName = "Select";
