import { createContext } from 'react'

export const KissflowSDKContext = createContext({ kf: null, sdkReady: false, sdkFailed: false })
