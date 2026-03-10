// ============================================================================
// SectionHeader — Collapsible section header for parameter groups
// ============================================================================

interface SectionHeaderProps {
  title: string;
  icon?: string;
}

export default function SectionHeader({ title, icon }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 mt-4 mb-2 pb-1 border-b border-red-900/30">
      {icon && <span className="text-lg">{icon}</span>}
      <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wide">
        {title}
      </h3>
    </div>
  );
}
