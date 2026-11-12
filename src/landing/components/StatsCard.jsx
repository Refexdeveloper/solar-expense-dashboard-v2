import { useState, useEffect, useRef } from 'react'
import { StatCardWatermark } from './SolarIllustrations.jsx'

const themeMap = {
    primary: {
        cardClass: 'stat-primary',
        iconBg: 'bg-primary-100',
        iconColor: 'text-primary-600',
        valueColor: 'text-primary-600',
        accent: '#0F766E',
    },
    warning: {
        cardClass: 'stat-warning',
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        valueColor: 'text-orange-600',
        accent: '#EA580C',
    },
    success: {
        cardClass: 'stat-success',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        valueColor: 'text-emerald-600',
        accent: '#16A34A',
    },
    danger: {
        cardClass: 'stat-danger',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        valueColor: 'text-red-600',
        accent: '#DC2626',
    },
    accent: {
        cardClass: 'stat-warning',
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        valueColor: 'text-orange-600',
        accent: '#EA580C',
    },
    secondary: {
        cardClass: 'stat-success',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        valueColor: 'text-emerald-600',
        accent: '#16A34A',
    },
}

function useCountUp(target, duration = 1000) {
    const [count, setCount] = useState(0)
    const startTime = useRef(null)
    const raf = useRef(null)

    useEffect(() => {
        startTime.current = null
        const animate = (timestamp) => {
            if (startTime.current === null) startTime.current = timestamp
            const progress = Math.min((timestamp - startTime.current) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) raf.current = requestAnimationFrame(animate)
        }
        raf.current = requestAnimationFrame(animate)
        return () => {
            if (raf.current) cancelAnimationFrame(raf.current)
        }
    }, [target, duration])

    return count
}

export default function StatsCard({ icon, title, value, gradientFrom, subtitle, isCurrency, index }) {
    const count = useCountUp(value)
    const [visible, setVisible] = useState(false)
    const theme = themeMap[gradientFrom] ?? themeMap.primary

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 50 + index * 50)
        return () => clearTimeout(timer)
    }, [index])

    return (
        <div
            className={`stat-card-mock ${theme.cardClass} relative p-5 min-h-[130px] transition-all duration-300 hover:shadow-lg ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
            style={{ transitionDelay: `${index * 0.05}s` }}
        >
            <StatCardWatermark variant={gradientFrom} accentColor={theme.accent} />

            <div className="relative z-10 flex gap-3.5">
                <div
                    className={`w-11 h-11 rounded-xl ${theme.iconBg} ${theme.iconColor} flex items-center justify-center shrink-0 shadow-sm`}
                >
                    <i className={`${icon} text-xl`} aria-hidden="true" />
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-foreground-600 text-sm font-semibold leading-tight">{title}</p>
                    <p className={`text-3xl md:text-4xl font-heading font-bold ${theme.valueColor} tabular-nums mt-1 leading-none`}>
                        {isCurrency ? '₹' : ''}
                        {count.toLocaleString('en-IN')}
                    </p>
                    <p className="text-foreground-400 text-xs mt-2 truncate">{subtitle}</p>
                </div>
            </div>
        </div>
    )
}
