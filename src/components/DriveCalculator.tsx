// ============================================================================
// DriveCalculator — two-sprocket chain drive ratio / length calculator
// ============================================================================

import { useState } from "react";
import { useLang } from "../i18n/LangContext";
import { useSettings, formatLength } from "../i18n/SettingsContext";
import { CHAIN_TABLE, getChainSpec } from "../data/chainTable";
import { computeDrive } from "../engine/sprocketGeometry";
import type { ChainStandard } from "../types/sprocket";
import NumberInput from "./NumberInput";

export default function DriveCalculator() {
  const { t } = useLang();
  const { units } = useSettings();

  const [standard, setStandard] = useState<ChainStandard>("ansi");
  const [chainNumber, setChainNumber] = useState(40);
  const [driverTeeth, setDriverTeeth] = useState(17);
  const [drivenTeeth, setDrivenTeeth] = useState(34);
  const [rpm, setRpm] = useState(1440);
  const [center, setCenter] = useState(400);

  const chains = CHAIN_TABLE.filter((c) => c.standard === standard);
  const spec = getChainSpec(standard, chainNumber) ?? chains[0];

  const result = computeDrive(driverTeeth, drivenTeeth, rpm, spec.pitch, center);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6">
      <h2 className="text-lg font-bold text-[var(--c-text)] mb-1">{t.driveTitle}</h2>
      <p className="text-xs text-[var(--c-text-muted)] mb-4">{t.driveDesc}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <div>
          <label className="text-sm text-[var(--c-text-2)]">{t.chainStandard}</label>
          <select
            value={standard}
            onChange={(e) => {
              const s = e.target.value as ChainStandard;
              setStandard(s);
              setChainNumber(CHAIN_TABLE.filter((c) => c.standard === s)[2]?.chainNumber ?? 40);
            }}
            className="mt-1 mb-2 w-full rounded-md border border-[var(--c-border)] bg-[var(--c-surface-2)] px-3 py-2 text-sm text-[var(--c-text)] focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="ansi">{t.standardAnsi}</option>
            <option value="iso">{t.standardIso}</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-[var(--c-text-2)]">{t.chainNumber}</label>
          <select
            value={chainNumber}
            onChange={(e) => setChainNumber(Number(e.target.value))}
            className="mt-1 mb-2 w-full rounded-md border border-[var(--c-border)] bg-[var(--c-surface-2)] px-3 py-2 text-sm text-[var(--c-text)] focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {chains.map((c) => (
              <option key={c.chainNumber} value={c.chainNumber}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <NumberInput label={t.driverTeeth} value={driverTeeth} onChange={(v) => setDriverTeeth(Math.max(7, Math.round(v)))} min={7} step={1} unit="" />
        <NumberInput label={t.drivenTeeth} value={drivenTeeth} onChange={(v) => setDrivenTeeth(Math.max(7, Math.round(v)))} min={7} step={1} unit="" />
        <NumberInput label={t.inputRpm} value={rpm} onChange={(v) => setRpm(Math.max(0, v))} min={0} step={10} unit="RPM" />
        <NumberInput label={t.centerDistance} value={center} onChange={(v) => setCenter(Math.max(1, v))} min={1} step={5} length />
      </div>

      <div className="mt-4 bg-[var(--c-surface-2)] rounded-lg p-4 border border-[var(--c-border)] grid grid-cols-2 gap-3 text-sm">
        <Result label={t.gearRatio} value={`${result.ratio} : 1`} />
        <Result label={t.outputRpm} value={`${result.drivenRpm} RPM`} />
        <Result label={t.chainLength} value={`${result.chainLinks} ${t.links}`} />
        <Result label={t.actualCenter} value={formatLength(result.centerDistanceMm, units)} />
      </div>
    </div>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[var(--c-text-muted)] text-xs">{label}</p>
      <p className="text-[var(--c-accent)] font-bold font-mono text-base">{value}</p>
    </div>
  );
}
