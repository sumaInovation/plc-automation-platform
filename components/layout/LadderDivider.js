export default function LadderDivider() {
  return (
    <div className="relative flex items-center justify-center py-2" aria-hidden="true">
      <div className="h-px flex-1 bg-slate-300" />
      <svg width="48" height="24" viewBox="0 0 48 24" className="mx-4 flex-shrink-0">
        <line x1="0" y1="12" x2="16" y2="12" stroke="#94A3B8" strokeWidth="1.5" />
        <line x1="32" y1="12" x2="48" y2="12" stroke="#94A3B8" strokeWidth="1.5" />
        <line x1="16" y1="6" x2="16" y2="18" stroke="#2C6E9E" strokeWidth="2" />
        <line x1="32" y1="6" x2="32" y2="18" stroke="#2C6E9E" strokeWidth="2" />
      </svg>
      <div className="h-px flex-1 bg-slate-300" />
    </div>
  );
}