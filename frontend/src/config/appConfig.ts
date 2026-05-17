const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export const defaultAppConfig = {
  apiBaseUrl: rawApiBaseUrl.replace(/\/$/, ''),
}
