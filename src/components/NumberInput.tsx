// ============================================================================
// NumberInput — Reusable numeric input with label, unit, and error display
// ============================================================================

import type { ChangeEvent } from "react";

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  error?: string;
  disabled?: boolean;
}

export default function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "mm",
  error,
  disabled = false,
}: NumberInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v)) onChange(v);
  };

  return (
    <div className="mb-2">
      <label className="flex items-center justify-between text-sm text-neutral-300">
        <span>{label}</span>
        {unit && <span className="text-xs text-neutral-600">{unit}</span>}
      </label>
      <input
        type="number"
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={`mt-1 w-full rounded-md border px-3 py-1.5 text-sm bg-[#1a0e0e] text-white
          focus:outline-none focus:ring-2 focus:ring-red-500
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? "border-red-500" : "border-red-900/40"}`}
      />
      {error && <p className="mt-0.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}
