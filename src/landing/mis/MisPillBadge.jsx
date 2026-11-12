/** Shared list pill — same shape as Status (rounded, inset ring, colored dot). */
export default function MisPillBadge({ label, badgeClass, dotClass, className = '' }) {
    if (!label || label === '—') {
        return <span className="text-slate-400">—</span>
    }
    return (
        <span
            title={label}
            className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${badgeClass} ${className}`}
        >
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClass || 'bg-slate-400'}`} aria-hidden />
            {label}
        </span>
    )
}
