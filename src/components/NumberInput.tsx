// ============================================================================
// NumberInput — numeric input with label, unit, tooltip, error & unit-awareness
// ============================================================================

import type { ChangeEvent, KeyboardEvent } from "react";
import { useSettings } from "../i18n/SettingsContext";

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
  /** Value is a length in mm — display/edit in the active unit (mm/in). */
  length?: boolean;
  /** Short explanation shown on a hover info icon. */
  tooltip?: string;
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
  length = false,
  tooltip,
}: NumberInputProps) {
  const { units, toDisplay, fromDisplay, unitLabel } = useSettings();

  const isImperial = length && units === "in";
  const dispValue = length ? toDisplay(value) : value;
  const dispStep = isImperial ? Math.max(0.01, step / 25.4) : step;
  const dispMin = length && min !== undefined ? toDisplay(min) : min;
  const dispMax = length && max !== undefined ? toDisplay(max) : max;
  const shownUnit = length ? unitLabel : unit;

  const emit = (display: number) => {
    onChange(length ? fromDisplay(display) : display);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v)) emit(v);
  };

  // Shift + Arrow = ×10 nudge (native arrows already step by `step`)
  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!e.shiftKey) return;
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const dir = e.key === "ArrowUp" ? 1 : -1;
      emit(dispValue + dir * dispStep * 10);
    }
  };

  // Round display to avoid long float tails after conversion
  const inputValue = Number.isFinite(dispValue)
    ? Math.round(dispValue * 1000) / 1000
    : dispValue;

  return (
    <div className="mb-2">
      <label className="flex items-center justify-between text-sm text-[var(--c-text-2)]">
        <span className="flex items-center gap-1">
          {label}
          {tooltip && (
            <span
              title={tooltip}
              className="cursor-help text-[10px] w-3.5 h-3.5 inline-flex items-center justify-center rounded-full border border-[var(--c-border)] text-[var(--c-text-muted)]"
            >
              i
            </span>
          )}
        </span>
        {shownUnit && (
          <span className="text-xs text-[var(--c-text-faint)]">{shownUnit}</span>
        )}
      </label>
      <input
        type="number"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKey}
        min={dispMin}
        max={dispMax}
        step={dispStep}
        disabled={disabled}
        className={`mt-1 w-full rounded-md border px-3 py-1.5 text-sm bg-[var(--c-surface-2)] text-[var(--c-text)]
          focus:outline-none focus:ring-2 focus:ring-red-500
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? "border-red-500" : "border-[var(--c-border)]"}`}
      />
      {error && <p className="mt-0.5 text-xs text-[var(--c-accent)]">{error}</p>}
    </div>
  );
}
