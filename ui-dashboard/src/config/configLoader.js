/**
 * Configuration Loader
 * Loads config from Vite dev server API endpoint
 * Priority: project config → general config → defaults
 */

// Default configuration
const DEFAULTS = {
  projectName: 'Control Pnanel D',
  browserTitle: 'Control Pnanel D',
  ports: {
    vite: 7106,
    websocket: 6106,
    api: 5106
  },
  websocket: {
    url: 'ws://localhost:6106/ws',
    reconnect: {
      initialDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 1.5
    }
  },
  api: {
    baseUrl: 'http://localhost:5106',
    endpoints: {
      sendRequest: '/api/send-request'
    }
  },
  messageTypes: {
    applicationState: 'application_state',
    appConfig: 'app_config'
  },
  footer: {
    text: 'UI Dashboard',
    link: 'https://github.com/yourusername/your-repo'
  },
  auth: {
    username: 'username',
    password: 'password'
  }
}

// Fetch config from Vite dev server
let yamlConfig = {}
let configSource = 'none'

// In development, fetch from API endpoint
if (import.meta.env.DEV) {
  try {
    const response = await fetch('/api/config')
    const data = await response.json()
    yamlConfig = data.config || {}
    configSource = data.source === 'project' ? 'project (../../configs/config-control-panel.yaml)' : 
                   data.source === 'general' ? 'general (config.yaml)' : 'none'
    console.log('✓ Loaded config from', configSource)
  } catch (error) {
    console.warn('Could not fetch config from API:', error)
    configSource = 'none'
  }
} else {
  // In production, config would need to be bundled or fetched differently
  console.warn('Production config loading not yet implemented')
}

// Merge function to combine configurations
function mergeConfig(defaults, yaml) {
  return {
    projectName: yaml.projectName || defaults.projectName,
    browserTitle: yaml.browserTitle || defaults.browserTitle,
    ports: {
      vite: yaml.ports?.vite || defaults.ports.vite,
      websocket: yaml.ports?.websocket || defaults.ports.websocket,
      api: yaml.ports?.api || defaults.ports.api
    },
    websocket: {
      url: yaml.websocket?.url || defaults.websocket.url,
      reconnect: {
        initialDelay: yaml.websocket?.reconnect?.initialDelay || defaults.websocket.reconnect.initialDelay,
        maxDelay: yaml.websocket?.reconnect?.maxDelay || defaults.websocket.reconnect.maxDelay,
        backoffMultiplier: yaml.websocket?.reconnect?.backoffMultiplier || defaults.websocket.reconnect.backoffMultiplier
      }
    },
    api: {
      baseUrl: yaml.api?.baseUrl || defaults.api.baseUrl,
      endpoints: {
        sendRequest: yaml.api?.endpoints?.sendRequest || defaults.api.endpoints.sendRequest
      }
    },
    messageTypes: {
      applicationState: yaml.messageTypes?.applicationState || defaults.messageTypes.applicationState,
      appConfig: yaml.messageTypes?.appConfig || defaults.messageTypes.appConfig
    },
    footer: {
      text: yaml.footer?.text || defaults.footer.text,
      link: yaml.footer?.link || defaults.footer.link
    },
    auth: {
      username: yaml.auth?.username || defaults.auth.username,
      password: yaml.auth?.password || defaults.auth.password
    }
  }
}

// Final merged configuration
export const loadedConfig = mergeConfig(DEFAULTS, yamlConfig)

// Export config source for display
export const configMetadata = {
  source: configSource,
  hasYaml: Object.keys(yamlConfig).length > 0,
  usingDefaults: configSource === 'none'
}

// Log configuration source for debugging
if (import.meta.env.DEV) {
  console.log('Configuration loaded:', {
    sources: {
      configFile: configSource,
      yaml: Object.keys(yamlConfig).length > 0 ? 'loaded' : 'none',
      defaults: 'active'
    },
    config: loadedConfig
  })
}

export default loadedConfig
