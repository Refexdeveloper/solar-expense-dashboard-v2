import StatsCard from './StatsCard.jsx'
import { REQUEST_TYPE_OPTIONS } from '../utils/pendingTasks.js'

export default function StatsCards({ stats, loading, requestType, onRequestTypeChange }) {
    return (
        <section className="w-full animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground-900 tracking-tight">
                            Overview
                        </h2>
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 ring-1 ring-emerald-100">
                            <i className="ri-leaf-fill text-emerald-600 text-sm" aria-hidden="true" />
                        </span>
                    </div>
                    <p className="text-foreground-500 text-sm mt-1">Key metrics at a glance</p>
                </div>

                <div className="flex flex-wrap gap-2 self-start lg:self-auto" role="group" aria-label="Request type">
                    {REQUEST_TYPE_OPTIONS.map((opt) => {
                        const active = requestType === opt.id
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                disabled={loading}
                                onClick={() => onRequestTypeChange(opt.id)}
                                className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all min-w-[130px] cursor-pointer disabled:opacity-60 ${
                                    active ? 'type-toggle-active' : 'type-toggle-inactive hover:bg-primary-50'
                                }`}
                            >
                                <i className={`${opt.icon} text-base`} aria-hidden="true" />
                                {opt.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
                {stats.map((stat, index) => (
                    <StatsCard
                        key={stat.id}
                        icon={stat.icon}
                        title={stat.title}
                        value={stat.value}
                        gradientFrom={stat.gradientFrom}
                        subtitle={stat.subtitle}
                        isCurrency={stat.isCurrency}
                        index={index}
                    />
                ))}
            </div>
        </section>
    )
}
