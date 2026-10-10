"use client";

import { MinusIcon, PlusIcon } from "./Icons";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max: number;
  label: string;
  size?: "sm" | "md";
  disabled?: boolean;
};

export default function QuantityStepper({ value, onChange, min = 1, max, label, size = "md", disabled = false }: Props) {
  const box = size === "sm" ? "h-9 w-9" : "h-12 w-12";
  return (
    <div role="group" aria-label={label} className={`inline-flex items-center border border-line-strong bg-surface ${disabled ? "opacity-50" : ""}`}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        className={`${box} inline-flex items-center justify-center text-ink transition-colors hover:bg-sunken disabled:cursor-not-allowed disabled:text-subtle disabled:hover:bg-transparent`}
      >
        <MinusIcon className="h-4 w-4" />
      </button>
      <output aria-live="polite" className={`min-w-8 text-center tabular-nums ${size === "sm" ? "text-sm" : "text-[15px]"}`}>
        {value}
      </output>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        className={`${box} inline-flex items-center justify-center text-ink transition-colors hover:bg-sunken disabled:cursor-not-allowed disabled:text-subtle disabled:hover:bg-transparent`}
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
