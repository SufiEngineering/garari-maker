// ============================================================================
// SectionHeader — Collapsible section header for parameter groups
// ============================================================================

interface SectionHeaderProps {
  title: string;
  icon?: string;
  /** Optional colour swatch tying the section to its preview layer colour. */
  color?: string;
}

export default function SectionHeader({ title, icon, color }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 mt-4 mb-2 pb-1 border-b border-[var(--c-border)]">
      {icon && <span className="text-lg">{icon}</span>}
      <h3 className="text-sm font-semibold text-[var(--c-accent)] uppercase tracking-wide">
        {title}
      </h3>
      {color && (
        <span
          className="ms-auto w-3 h-3 rounded-full border border-black/20 shrink-0"
          style={{ background: color }}
          title="Preview colour"
        />
      )}
    </div>
  );
}
