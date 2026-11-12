import KFSDK from '@kissflow/lowcode-client-sdk'
import React, { useEffect, useState } from 'react'
import { KissflowSDKContext } from './context.jsx'

let kf

export function SDKWrapper(props) {
    const [kfInstance, setKfInstance] = useState(null)
    const [sdkFailed, setSdkFailed] = useState(false)
    // True once init succeeds OR fails — dashboards must not wait forever on preview.
    const [sdkSettled, setSdkSettled] = useState(false)

    useEffect(() => {
        const existing = typeof window !== 'undefined' ? window.kf : null
        // Only reuse an already-initialized client. A stub without `.api` must go through initialize().
        if (existing && typeof existing.api === 'function') {
            kf = existing
            setKfInstance(existing)
            setSdkFailed(false)
            setSdkSettled(true)
            return
        }

        KFSDK.initialize()
            .then((sdk) => {
                window.kf = kf = sdk
                setKfInstance(sdk)
                setSdkFailed(false)
                setSdkSettled(true)
            })
            .catch((err) => {
                setSdkFailed(true)
                setSdkSettled(true)
                console.warn('SDK not available (preview mode):', err?.message || err)
            })
    }, [])

    return (
        <KissflowSDKContext.Provider value={{ kf: kfInstance, sdkReady: sdkSettled, sdkFailed }}>
            <>
                {sdkFailed && (
                    <div
                        style={{
                            padding: '8px 16px',
                            background: '#fef3c7',
                            color: '#92400e',
                            fontSize: 12,
                            textAlign: 'center',
                        }}
                    >
                        Preview mode - connect in a Kissflow app for full integration.
                    </div>
                )}
                {props.children}
            </>
        </KissflowSDKContext.Provider>
    )
}

export { kf }
