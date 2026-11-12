import FloatingActionButton from './FloatingActionButton.jsx'
import { SolarAvatarIcon } from './SolarIllustrations.jsx'

export default function WelcomeHeader({ userName, companyName, onFabAction, showFabAction, loadError }) {
    const displayName = userName?.trim() || 'User'

    return (
        <div className="dashboard-header relative w-full px-5 py-5 sm:px-7 sm:py-6">
            <div className="dashboard-header-inner relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="welcome-avatar-badge shrink-0">
                        <SolarAvatarIcon className="h-14 w-14 sm:h-[4.25rem] sm:w-[4.25rem]" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="welcome-title font-heading text-xl font-bold leading-tight sm:text-[1.65rem]">
                            Welcome, {displayName}{' '}
                            <span role="img" aria-label="sun">
                                ☀️
                            </span>
                        </h1>
                        <p className="welcome-subtitle font-body mt-1 truncate text-sm sm:text-base">{companyName}</p>
                        {loadError ? (
                            <p className="mt-1 text-sm font-medium text-amber-100">{loadError}</p>
                        ) : null}
                    </div>
                </div>

                {showFabAction ? (
                    <div className="header-fab-zone relative ml-auto self-start sm:self-center">
                        <FloatingActionButton onAction={onFabAction} />
                    </div>
                ) : null}
            </div>
        </div>
    )
}
