import { createContext, type PropsWithChildren } from 'react'
import { defaultAppConfig } from '../../config/appConfig'

type AppConfig = {
  apiBaseUrl: string
}

const AppConfigContext = createContext<AppConfig | undefined>(undefined)

export function AppConfigProvider({ children }: PropsWithChildren) {
  return <AppConfigContext.Provider value={defaultAppConfig}>{children}</AppConfigContext.Provider>
}

export { AppConfigContext }

