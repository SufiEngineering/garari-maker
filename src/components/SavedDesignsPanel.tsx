// ============================================================================
// SavedDesignsPanel — save / load / delete sprocket configs in localStorage
// ============================================================================

import { useState } from "react";
import type { SprocketParams, SavedDesign } from "../types/sprocket";
import { useLang } from "../i18n/LangContext";
import {
  loadDesigns,
  saveDesign,
  deleteDesign,
} from "../utils/savedDesigns";

interface Props {
  params: SprocketParams;
  onLoad: (params: SprocketParams) => void;
}

export default function SavedDesignsPanel({ params, onLoad }: Props) {
  const { t } = useLang();
  const [designs, setDesigns] = useState<SavedDesign[]>(() => loadDesigns());
  const [name, setName] = useState("");

  const handleSave = () => {
    setDesigns(saveDesign(name || `T${params.numTeeth} #${params.chainNumber}`, params));
    setName("");
  };

  const handleDelete = (id: string) => setDesigns(deleteDesign(id));

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.designName}
          className="flex-1 rounded-md border border-[var(--c-border)] bg-[var(--c-surface-2)] px-2 py-1.5 text-xs text-[var(--c-text)] focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          onClick={handleSave}
          className="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
        >
          {t.saveDesign}
        </button>
      </div>

      {designs.length === 0 ? (
        <p className="text-[11px] text-[var(--c-text-faint)]">{t.noDesigns}</p>
      ) : (
        <ul className="space-y-1 max-h-44 overflow-y-auto">
          {designs.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between gap-2 bg-[var(--c-surface-2)] rounded-md px-2 py-1.5 border border-[var(--c-border)]"
            >
              <button
                onClick={() => onLoad(d.params)}
                className="flex-1 text-start text-xs text-[var(--c-text-2)] hover:text-[var(--c-accent)] cursor-pointer truncate"
                title={t.loadDesign}
              >
                {d.name}
              </button>
              <button
                onClick={() => handleDelete(d.id)}
                className="text-[var(--c-text-faint)] hover:text-red-400 cursor-pointer text-sm leading-none"
                title={t.deleteDesign}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
