const statusConfig = {
    Approved: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        dot: 'bg-emerald-500',
        ring: 'ring-emerald-200',
    },
    Pending: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        dot: 'bg-amber-500',
        ring: 'ring-amber-200',
    },
    Rejected: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        dot: 'bg-red-500',
        ring: 'ring-red-200',
    },
}

export default function StatusBadge({ status }) {
    const config = statusConfig[status] ?? statusConfig.Pending

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${config.bg} ${config.text} ${config.ring}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {status}
        </span>
    )
}
