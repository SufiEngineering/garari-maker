// ============================================================================
// App — Main Garari Maker application
// ============================================================================

import { useState, useMemo, useCallback, useEffect } from "react";
import type { SprocketParams } from "./types/sprocket";
import {
  calculateDimensions,
  validateParams,
  hasBlockingErrors,
  buildSprocketModel,
  exportToSVG,
  exportToDXF,
  exportNestedDXF,
  generateDxfFilename,
  estimateWeight,
} from "./engine/sprocketGeometry";
import { useLang } from "./i18n/LangContext";
import { useSettings } from "./i18n/SettingsContext";
import { readUrlParams, encodeParams } from "./utils/shareLink";
import { downloadText } from "./utils/exporters";
import { CHAIN_TABLE } from "./data/chainTable";
import { MATERIALS } from "./data/materials";
import ParameterPanel from "./components/ParameterPanel";
import PreviewPanel from "./components/PreviewPanel";
import DownloadModal from "./components/DownloadModal";
import SpecSheet from "./components/SpecSheet";
import GearTool from "./components/GearTool";
import DriveCalculator from "./components/DriveCalculator";

type Tool = "sprocket" | "gear" | "drive";

// ============================================================================
// Default parameter values
// ============================================================================
const DEFAULT_PARAMS: SprocketParams = {
  standard: "ansi",
  chainNumber: 40,
  strandCount: 1,
  numTeeth: 17,
  idler: false,
  boreDiameter: 12,
  hubEnabled: false,
  hubDiameter: 25,
  hubDoubleSided: false,
  hubLength: 10,
  setScrewEnabled: false,
  setScrewDiameter: 6,
  mountingHolesEnabled: false,
  mountingHoleCount: 4,
  mountingHoleDiameter: 5,
  boltCircleDiameter: 40,
  keywayEnabled: false,
  keywayWidth: 4,
  keywayDepth: 2.5,
  lighteningPattern: "none",
  lighteningCount: 6,
  lighteningSize: 12,
  materialKey: "mild_steel",
  plateThickness: 6,
};

function getInitialParams(): SprocketParams {
  return readUrlParams() ?? DEFAULT_PARAMS;
}

/** Build a random-ish demo configuration. */
function makeExample(): SprocketParams {
  const chains = CHAIN_TABLE.filter((c) => c.standard === "ansi");
  const chain = chains[Math.floor(Math.random() * chains.length)];
  const teeth = 12 + Math.floor(Math.random() * 40);
  return {
    ...DEFAULT_PARAMS,
    chainNumber: chain.chainNumber,
    numTeeth: teeth,
    boreDiameter: 10 + Math.floor(Math.random() * 15),
    hubEnabled: Math.random() > 0.5,
    hubDiameter: 30 + Math.floor(Math.random() * 20),
    mountingHolesEnabled: Math.random() > 0.5,
    mountingHoleCount: 3 + Math.floor(Math.random() * 4),
    lighteningPattern: Math.random() > 0.6 ? "holes" : "none",
    materialKey: MATERIALS[Math.floor(Math.random() * MATERIALS.length)].key,
  };
}

export default function App() {
  const [params, setParamsRaw] = useState<SprocketParams>(getInitialParams);
  const [past, setPast] = useState<SprocketParams[]>([]);
  const [future, setFuture] = useState<SprocketParams[]>([]);
  const [tool, setTool] = useState<Tool>("sprocket");
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showSpec, setShowSpec] = useState(false);
  const [mobileTab, setMobileTab] = useState<"params" | "preview">("params");
  const [quantity, setQuantity] = useState(1);
  const { t, setLang, lang, langs, isUrdu, isRtl } = useLang();
  const { units, toggleUnits, theme, toggleTheme } = useSettings();

  // History-aware setter
  const setParams = useCallback((next: SprocketParams) => {
    setParamsRaw((prev) => {
      setPast((p) => [...p, prev].slice(-50));
      setFuture([]);
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setPast((p) => {
      if (!p.length) return p;
      const prev = p[p.length - 1];
      setParamsRaw((cur) => {
        setFuture((f) => [cur, ...f]);
        return prev;
      });
      return p.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (!f.length) return f;
      const next = f[0];
      setParamsRaw((cur) => {
        setPast((p) => [...p, cur]);
        return next;
      });
      return f.slice(1);
    });
  }, []);

  const dims = useMemo(() => calculateDimensions(params), [params]);
  const errors = useMemo(() => validateParams(params), [params]);
  const blocking = hasBlockingErrors(errors);
  const weight = useMemo(() => (dims ? estimateWeight(params, dims) : null), [params, dims]);

  useEffect(() => {
    window.history.replaceState(null, "", `#${encodeParams(params)}`);
  }, [params]);

  const svgContent = useMemo(() => {
    if (blocking || !dims) return "";
    const model = buildSprocketModel(params);
    return model ? exportToSVG(model) : "";
  }, [params, blocking, dims]);

  const handleExport = useCallback(() => {
    if (blocking) return;
    const model = buildSprocketModel(params);
    if (!model) return;
    downloadText(exportToDXF(model), generateDxfFilename(params), "application/dxf");
    setShowDownloadModal(true);
  }, [params, blocking]);

  const handleExportStl = useCallback(async () => {
    if (blocking) return;
    const { exportSprocketSTL } = await import("./engine/sprocketMesh");
    const stl = exportSprocketSTL(params);
    if (stl) downloadText(stl, generateDxfFilename(params).replace(/\.dxf$/, ".stl"), "model/stl");
  }, [params, blocking]);

  const handleExportNested = useCallback(
    (count: number, gap: number) => {
      if (blocking) return;
      const model = buildSprocketModel(params);
      if (!model) return;
      downloadText(
        exportNestedDXF(model, count, gap),
        generateDxfFilename(params).replace(/\.dxf$/, `_batch${count}.dxf`),
        "application/dxf"
      );
    },
    [params, blocking]
  );

  return (
    <div
      className={`h-screen w-screen flex flex-col bg-[var(--c-bg)] text-[var(--c-text)] overflow-hidden ${isUrdu ? "font-urdu" : ""}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Top branding bar */}
      <header className="flex items-center justify-between gap-2 px-3 sm:px-5 py-2 bg-[var(--c-surface-2)] border-b border-[var(--c-border)]">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-xs sm:text-sm shadow-lg shadow-red-900/50">
            G
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-[var(--c-text)] tracking-tight leading-none truncate">{t.appName}</h1>
            <p className="text-[9px] sm:text-[10px] text-[var(--c-accent-2)] tracking-wide truncate">{t.appSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Units */}
          <button
            onClick={toggleUnits}
            title={t.units}
            className="px-2 py-1 rounded-md text-xs font-semibold bg-red-900/30 hover:bg-red-900/50 border border-red-800/40 text-[var(--c-accent-2)] hover:text-[var(--c-text)] transition-colors cursor-pointer"
          >
            {units === "mm" ? "mm" : "in"}
          </button>
          {/* Theme */}
          <button
            onClick={toggleTheme}
            title={t.theme}
            className="px-2 py-1 rounded-md text-xs font-semibold bg-red-900/30 hover:bg-red-900/50 border border-red-800/40 text-[var(--c-accent-2)] hover:text-[var(--c-text)] transition-colors cursor-pointer"
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>
          {/* Language */}
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as typeof lang)}
            title={t.language}
            className="px-1.5 py-1 rounded-md text-xs font-semibold bg-red-900/30 border border-red-800/40 text-[var(--c-accent-2)] focus:outline-none cursor-pointer"
          >
            {langs.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Tool tabs */}
      <div className="flex items-center justify-between bg-[var(--c-surface)] border-b border-[var(--c-border)] px-2">
        <div className="flex">
          {([
            ["sprocket", t.toolSprocket, "⚙️"],
            ["gear", t.toolGear, "🛞"],
            ["drive", t.toolDrive, "🧮"],
          ] as [Tool, string, string][]).map(([key, label, icon]) => (
            <button
              key={key}
              onClick={() => setTool(key)}
              className={`px-3 py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                tool === key
                  ? "text-[var(--c-accent)] border-b-2 border-red-500"
                  : "text-[var(--c-text-muted)] hover:text-[var(--c-text-2)]"
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Sprocket history controls */}
        {tool === "sprocket" && (
          <div className="flex items-center gap-1">
            <ToolbarBtn onClick={undo} disabled={!past.length} title={t.undo}>↶</ToolbarBtn>
            <ToolbarBtn onClick={redo} disabled={!future.length} title={t.redo}>↷</ToolbarBtn>
            <ToolbarBtn onClick={() => setParams(makeExample())} title={t.loadExample}>🎲</ToolbarBtn>
            <ToolbarBtn onClick={() => setParams(DEFAULT_PARAMS)} title={t.resetDefaults}>↺</ToolbarBtn>
          </div>
        )}
      </div>

      {tool === "sprocket" ? (
        <>
          {/* Mobile tab bar */}
          <div className="flex md:hidden border-b border-[var(--c-border)] bg-[var(--c-surface)]">
            <button onClick={() => setMobileTab("params")} className={`flex-1 py-2.5 text-sm font-semibold text-center transition-colors cursor-pointer ${mobileTab === "params" ? "text-[var(--c-accent)] border-b-2 border-red-500 bg-red-950/20" : "text-[var(--c-text-muted)] hover:text-[var(--c-text-2)]"}`}>{t.tabParameters}</button>
            <button onClick={() => setMobileTab("preview")} className={`flex-1 py-2.5 text-sm font-semibold text-center transition-colors cursor-pointer ${mobileTab === "preview" ? "text-[var(--c-accent)] border-b-2 border-red-500 bg-red-950/20" : "text-[var(--c-text-muted)] hover:text-[var(--c-text-2)]"}`}>{t.tabPreview}</button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className={`${mobileTab === "params" ? "flex" : "hidden"} md:flex w-full md:w-80 md:min-w-[320px] flex-col`}>
              <ParameterPanel
                params={params}
                dims={dims}
                errors={errors}
                onChange={setParams}
                onExport={handleExport}
                onExportStl={handleExportStl}
                onExportNested={handleExportNested}
                onPrintSpec={() => setShowSpec(true)}
                quantity={quantity}
                onQuantityChange={setQuantity}
                weight={weight}
              />
            </div>
            <div className={`${mobileTab === "preview" ? "flex" : "hidden"} md:flex flex-1 flex-col`}>
              <PreviewPanel svgContent={svgContent} params={params} dims={dims} />
            </div>
          </div>
        </>
      ) : tool === "gear" ? (
        <GearTool />
      ) : (
        <div className="flex-1 overflow-y-auto">
          <DriveCalculator />
        </div>
      )}

      {showDownloadModal && (
        <DownloadModal params={params} dims={dims} quantity={quantity} onClose={() => setShowDownloadModal(false)} />
      )}
      {showSpec && (
        <SpecSheet params={params} dims={dims} weight={weight} svgContent={svgContent} onClose={() => setShowSpec(false)} />
      )}
    </div>
  );
}

function ToolbarBtn({
  onClick,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-7 h-7 flex items-center justify-center rounded-md text-sm bg-red-900/20 hover:bg-red-900/40 border border-red-800/30 text-[var(--c-accent-2)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
    >
      {children}
    </button>
  );
}
