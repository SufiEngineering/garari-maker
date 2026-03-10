// ============================================================================
// ParameterPanel — Left panel with all sprocket parameter inputs
// ============================================================================

import type { SprocketParams, CalculatedDimensions, ValidationError } from "../types/sprocket";
import { CHAIN_TABLE } from "../data/chainTable";
import NumberInput from "./NumberInput";
import ToggleSwitch from "./ToggleSwitch";
import SectionHeader from "./SectionHeader";

interface ParameterPanelProps {
  params: SprocketParams;
  dims: CalculatedDimensions | null;
  errors: ValidationError[];
  onChange: (params: SprocketParams) => void;
  onExport: () => void;
}

/** Helper to find a validation error for a specific field */
function getError(errors: ValidationError[], field: string): string | undefined {
  return errors.find((e) => e.field === field)?.message;
}

export default function ParameterPanel({
  params,
  dims,
  errors,
  onChange,
  onExport,
}: ParameterPanelProps) {
  /** Shorthand to update a single parameter */
  const set = <K extends keyof SprocketParams>(
    key: K,
    value: SprocketParams[K]
  ) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div className="param-panel w-80 min-w-[320px] h-full overflow-y-auto bg-[#140a0a] border-r border-red-900/30 p-4 flex flex-col">

      {/* ================================================================ */}
      {/* CHAIN PARAMETERS */}
      {/* ================================================================ */}
      <SectionHeader title="Chain" icon="🔗" />

      <div className="mb-2">
        <label className="text-sm text-neutral-300">Chain Number</label>
        <select
          value={params.chainNumber}
          onChange={(e) => set("chainNumber", Number(e.target.value))}
          className="mt-1 w-full rounded-md border border-red-900/40 bg-[#1a0e0e] px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {CHAIN_TABLE.map((c) => (
            <option key={c.chainNumber} value={c.chainNumber}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Display chain info */}
      {dims && (
        <div className="text-xs text-neutral-500 space-y-0.5 mb-2 pl-1">
          <p>Pitch: <span className="text-neutral-300">{dims.pitch.toFixed(3)} mm</span></p>
          <p>Roller ⌀: <span className="text-neutral-300">{dims.rollerDiameter.toFixed(2)} mm</span></p>
        </div>
      )}

      {/* ================================================================ */}
      {/* TEETH */}
      {/* ================================================================ */}
      <SectionHeader title="Teeth" icon="🦷" />

      <NumberInput
        label="Number of Teeth"
        value={params.numTeeth}
        onChange={(v) => set("numTeeth", Math.round(v))}
        min={8}
        max={120}
        step={1}
        unit=""
        error={getError(errors, "numTeeth")}
      />

      {/* ================================================================ */}
      {/* BORE / HUB */}
      {/* ================================================================ */}
      <SectionHeader title="Bore & Hub" icon="⭕" />

      <NumberInput
        label="Bore Diameter"
        value={params.boreDiameter}
        onChange={(v) => set("boreDiameter", v)}
        min={0.1}
        step={0.5}
        error={getError(errors, "boreDiameter")}
      />

      <ToggleSwitch
        label="Hub Circle"
        checked={params.hubEnabled}
        onChange={(v) => set("hubEnabled", v)}
      />

      {params.hubEnabled && (
        <NumberInput
          label="Hub Diameter"
          value={params.hubDiameter}
          onChange={(v) => set("hubDiameter", v)}
          min={0.1}
          step={0.5}
          error={getError(errors, "hubDiameter")}
        />
      )}

      {/* ================================================================ */}
      {/* MOUNTING HOLES */}
      {/* ================================================================ */}
      <SectionHeader title="Mounting Holes" icon="🕳️" />

      <ToggleSwitch
        label="Enable Bolt Holes"
        checked={params.mountingHolesEnabled}
        onChange={(v) => set("mountingHolesEnabled", v)}
      />

      {params.mountingHolesEnabled && (
        <>
          <NumberInput
            label="Number of Holes"
            value={params.mountingHoleCount}
            onChange={(v) => set("mountingHoleCount", Math.round(v))}
            min={2}
            max={12}
            step={1}
            unit=""
            error={getError(errors, "mountingHoleCount")}
          />
          <NumberInput
            label="Hole Diameter"
            value={params.mountingHoleDiameter}
            onChange={(v) => set("mountingHoleDiameter", v)}
            min={0.1}
            step={0.5}
            error={getError(errors, "mountingHoleDiameter")}
          />
          <NumberInput
            label="Bolt Circle Diameter"
            value={params.boltCircleDiameter}
            onChange={(v) => set("boltCircleDiameter", v)}
            min={0.1}
            step={0.5}
            error={getError(errors, "boltCircleDiameter")}
          />
        </>
      )}

      {/* ================================================================ */}
      {/* KEYWAY */}
      {/* ================================================================ */}
      <SectionHeader title="Keyway" icon="🔑" />

      <ToggleSwitch
        label="Enable Keyway"
        checked={params.keywayEnabled}
        onChange={(v) => set("keywayEnabled", v)}
      />

      {params.keywayEnabled && (
        <>
          <NumberInput
            label="Keyway Width"
            value={params.keywayWidth}
            onChange={(v) => set("keywayWidth", v)}
            min={0.1}
            step={0.5}
            error={getError(errors, "keywayWidth")}
          />
          <NumberInput
            label="Keyway Depth"
            value={params.keywayDepth}
            onChange={(v) => set("keywayDepth", v)}
            min={0.1}
            step={0.5}
            error={getError(errors, "keywayDepth")}
          />
        </>
      )}

      {/* ================================================================ */}
      {/* CALCULATED DIMENSIONS */}
      {/* ================================================================ */}
      {dims && (
        <>
          <SectionHeader title="Calculated Dimensions" icon="📐" />
          <div className="bg-[#1a0e0e] rounded-lg p-3 text-xs space-y-1.5 border border-red-900/30">
            <DimRow label="Pitch Diameter" value={dims.pitchDiameter} />
            <DimRow label="Outside Diameter" value={dims.outsideDiameter} />
            <DimRow label="Root Diameter" value={dims.rootDiameter} />
          </div>
        </>
      )}

      {/* ================================================================ */}
      {/* EXPORT BUTTON */}
      {/* ================================================================ */}
      <div className="mt-auto pt-4">
        <button
          onClick={onExport}
          disabled={errors.length > 0}
          className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all
            bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30
            disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed disabled:shadow-none
            active:scale-[0.98] cursor-pointer"
        >
          📥 Download DXF
        </button>
        {errors.length > 0 && (
          <p className="text-xs text-red-400 text-center mt-1">
            Fix errors before exporting
          </p>
        )}
        <p className="text-[10px] text-neutral-600 text-center mt-2">
          Free tool by Sufi Engineering
        </p>
      </div>
    </div>
  );
}

/** Small helper component to display a dimension row */
function DimRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-neutral-500">{label}</span>
      <span className="text-red-300 font-mono">{value.toFixed(3)} mm</span>
    </div>
  );
}
