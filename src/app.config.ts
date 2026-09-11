// Cepat UI — App Configuration
// Edit file ini untuk customize behavior template

export interface AppConfig {
  name: string
  description: string
  logo?: string

  sidebar: {
    collapsible: boolean
    defaultCollapsed: boolean
    width: string
    collapsedWidth: string
  }

  auth: {
    loginRoute: string
    defaultRedirect: string
    persistStrategy: 'localStorage' | 'sessionStorage' | 'cookie'
  }

  features: {
    darkMode: boolean
    commandPalette: boolean
    notifications: boolean
  }

  theme: {
    primary: string
    gray: string
    radius: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  }
}

export const appConfig: AppConfig = {
  name: 'Cepat UI',
  description: 'Vue 3 Dashboard Starter Template',

  sidebar: {
    collapsible: true,
    defaultCollapsed: false,
    width: '260px',
    collapsedWidth: '64px',
  },

  auth: {
    loginRoute: '/login',
    defaultRedirect: '/dashboard',
    persistStrategy: 'localStorage',
  },

  features: {
    darkMode: true,
    commandPalette: false,
    notifications: true,
  },

  theme: {
    primary: 'emerald',
    gray: 'slate',
    radius: 'md',
  },
}

export default appConfig
