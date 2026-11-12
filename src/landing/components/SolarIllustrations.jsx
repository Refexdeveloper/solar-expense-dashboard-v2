/** Decorative SVGs matching the Solar Expense Dashboard mockup. */

export function SolarAvatarIcon({ className = 'w-12 h-12' }) {
    return (
        <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <circle cx="24" cy="24" r="24" fill="#FFFFFF" />
            <circle cx="24" cy="15" r="5.5" fill="#FACC15" />
            <g stroke="#FDE047" strokeWidth="1.2" strokeLinecap="round">
                <line x1="24" y1="6" x2="24" y2="8.5" />
                <line x1="24" y1="21" x2="24" y2="23" />
                <line x1="15" y1="15" x2="16.8" y2="16.8" />
                <line x1="31.2" y1="16.8" x2="33" y2="15" />
            </g>
            <rect x="11" y="25" width="26" height="13" rx="2" fill="#059669" stroke="#6EE7B7" strokeWidth="0.8" />
            <line x1="17.5" y1="25" x2="17.5" y2="38" stroke="#A7F3D0" strokeWidth="0.7" />
            <line x1="24" y1="25" x2="24" y2="38" stroke="#A7F3D0" strokeWidth="0.7" />
            <line x1="30.5" y1="25" x2="30.5" y2="38" stroke="#A7F3D0" strokeWidth="0.7" />
        </svg>
    )
}

export function SolarSectionIcon({ className = 'w-8 h-8' }) {
    return (
        <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="#F0FDFA" />
            <circle cx="16" cy="11" r="4" fill="#FBBF24" />
            <rect x="7" y="17" width="18" height="9" rx="1.5" fill="#0F766E" opacity="0.9" />
            <line x1="13" y1="17" x2="13" y2="26" stroke="#5EEAD4" strokeWidth="0.6" />
            <line x1="16" y1="17" x2="16" y2="26" stroke="#5EEAD4" strokeWidth="0.6" />
            <line x1="19" y1="17" x2="19" y2="26" stroke="#5EEAD4" strokeWidth="0.6" />
        </svg>
    )
}

function WatermarkSolarPanels({ color = '#0F766E' }) {
    return (
        <g opacity="0.12" fill={color}>
            <rect x="60" y="28" width="36" height="20" rx="2" />
            <rect x="100" y="32" width="28" height="16" rx="2" />
            <rect x="72" y="52" width="40" height="18" rx="2" />
        </g>
    )
}

function WatermarkWind({ color = '#EA580C' }) {
    return (
        <g opacity="0.12" stroke={color} strokeWidth="2" fill="none">
            <line x1="120" y1="70" x2="120" y2="30" />
            <circle cx="120" cy="28" r="4" fill={color} opacity="0.12" />
            <ellipse cx="120" cy="28" rx="18" ry="4" transform="rotate(0 120 28)" />
            <ellipse cx="120" cy="28" rx="18" ry="4" transform="rotate(60 120 28)" />
            <ellipse cx="120" cy="28" rx="18" ry="4" transform="rotate(120 120 28)" />
        </g>
    )
}

function WatermarkBattery({ color = '#16A34A' }) {
    return (
        <g opacity="0.12" fill={color}>
            <rect x="85" y="35" width="40" height="24" rx="4" />
            <rect x="125" y="42" width="6" height="10" rx="2" />
            <rect x="92" y="42" width="8" height="10" rx="1" fill="white" opacity="0.5" />
        </g>
    )
}

function WatermarkSun({ color = '#DC2626' }) {
    return (
        <g opacity="0.12" fill={color}>
            <circle cx="110" cy="45" r="14" />
        </g>
    )
}

const WATERMARKS = {
    primary: WatermarkSolarPanels,
    warning: WatermarkWind,
    success: WatermarkBattery,
    danger: WatermarkSun,
}

export function StatCardWatermark({ variant = 'primary', accentColor }) {
    const Wm = WATERMARKS[variant] ?? WatermarkSolarPanels
    return (
        <svg
            className="absolute bottom-0 right-0 w-36 h-20 pointer-events-none"
            viewBox="0 0 140 80"
            aria-hidden="true"
        >
            <Wm color={accentColor} />
        </svg>
    )
}

export function EmptyStateIllustration({ className = 'w-64 h-40' }) {
    return (
        <svg className={className} viewBox="0 0 280 160" fill="none" aria-hidden="true">
            <ellipse cx="140" cy="145" rx="100" ry="8" fill="#E2E8F0" />
            <rect x="40" y="90" width="50" height="30" rx="3" fill="#0F766E" opacity="0.85" />
            <rect x="95" y="85" width="45" height="28" rx="3" fill="#14B8A6" opacity="0.7" />
            <rect x="145" y="92" width="48" height="32" rx="3" fill="#0F766E" opacity="0.85" />
            <rect x="200" y="88" width="42" height="28" rx="3" fill="#5EEAD4" opacity="0.75" />
            <line x1="55" y1="90" x2="55" y2="120" stroke="#99F6E4" strokeWidth="0.8" />
            <line x1="70" y1="90" x2="70" y2="120" stroke="#99F6E4" strokeWidth="0.8" />
            <line x1="160" y1="92" x2="160" y2="124" stroke="#99F6E4" strokeWidth="0.8" />
            <line x1="178" y1="92" x2="178" y2="124" stroke="#99F6E4" strokeWidth="0.8" />
            <line x1="230" y1="70" x2="230" y2="116" stroke="#64748B" strokeWidth="2" />
            <circle cx="230" cy="62" r="5" fill="#94A3B8" />
            <ellipse cx="230" cy="62" rx="16" ry="3" stroke="#94A3B8" strokeWidth="1.5" fill="none" transform="rotate(0 230 62)" />
            <ellipse cx="230" cy="62" rx="16" ry="3" stroke="#94A3B8" strokeWidth="1.5" fill="none" transform="rotate(60 230 62)" />
            <ellipse cx="230" cy="62" rx="16" ry="3" stroke="#94A3B8" strokeWidth="1.5" fill="none" transform="rotate(120 230 62)" />
            <circle cx="200" cy="35" r="18" fill="#FBBF24" opacity="0.9" />
            <g stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" opacity="0.7">
                <line x1="200" y1="10" x2="200" y2="16" />
                <line x1="200" y1="54" x2="200" y2="60" />
                <line x1="175" y1="35" x2="181" y2="35" />
                <line x1="219" y1="35" x2="225" y2="35" />
            </g>
            <rect x="115" y="55" width="22" height="14" rx="2" fill="#16A34A" opacity="0.6" />
            <rect x="122" y="50" width="8" height="5" rx="1" fill="#16A34A" opacity="0.6" />
        </svg>
    )
}
