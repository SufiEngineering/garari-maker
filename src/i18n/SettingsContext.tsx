/* eslint-disable react-refresh/only-export-components -- context file intentionally exports its hook & helpers alongside the provider */
// ============================================================================
// Settings Context — display units (mm/in) and theme (dark/light)
// ============================================================================
// Internal geometry is always millimetres. Units here only affect *display*.
// Both settings persist to localStorage and the theme is mirrored onto
// <html> as a class so CSS variables (and the 3D canvas) can react globally.
// ============================================================================

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Units = "mm" | "in";
export type Theme = "dark" | "light";

const MM_PER_INCH = 25.4;

interface SettingsValue {
  units: Units;
  theme: Theme;
  toggleUnits: () => void;
  toggleTheme: () => void;
  /** Convert a millimetre value into the active display unit. */
  toDisplay: (mm: number) => number;
  /** Convert a value entered in the active display unit back to millimetres. */
  fromDisplay: (val: number) => number;
  /** Suffix label for lengths in the active unit. */
  unitLabel: string;
}

const SettingsContext = createContext<SettingsValue>({
  units: "mm",
  theme: "dark",
  toggleUnits: () => {},
  toggleTheme: () => {},
  toDisplay: (mm) => mm,
  fromDisplay: (v) => v,
  unitLabel: "mm",
});

function readStored<T extends string>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return (v as T) ?? fallback;
  } catch {
    return fallback;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [units, setUnits] = useState<Units>(() => readStored("gm_units", "mm"));
  const [theme, setTheme] = useState<Theme>(() => readStored("gm_theme", "dark"));

  useEffect(() => {
    try {
      localStorage.setItem("gm_units", units);
    } catch {
      /* ignore */
    }
  }, [units]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-dark", "theme-light");
    root.classList.add(theme === "light" ? "theme-light" : "theme-dark");
    try {
      localStorage.setItem("gm_theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggleUnits = () => setUnits((u) => (u === "mm" ? "in" : "mm"));
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const toDisplay = (mm: number) =>
    units === "in" ? mm / MM_PER_INCH : mm;
  const fromDisplay = (val: number) =>
    units === "in" ? val * MM_PER_INCH : val;

  return (
    <SettingsContext.Provider
      value={{
        units,
        theme,
        toggleUnits,
        toggleTheme,
        toDisplay,
        fromDisplay,
        unitLabel: units,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

/** Format a millimetre length for display in the given unit. */
export function formatLength(mm: number, units: Units, digits = 2): string {
  const v = units === "in" ? mm / MM_PER_INCH : mm;
  return `${v.toFixed(digits)} ${units}`;
}
