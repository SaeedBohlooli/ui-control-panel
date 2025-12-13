/**
 * Configuration Loader
 * Two-level configuration hierarchy:
 * 1. YAML config file (config.yaml) - highest priority
 * 2. Hardcoded defaults - lowest priority
 * 
 * Configuration file priority:
 * - First tries: ../../configs/config-control-panel.yaml (project config)
 * - Falls back to: ./config.yaml (general config in project root)
 */

// Try to load configs using Vite's glob import with query parameter to bust cache
const projectConfigs = import.meta.glob('../../configs/config-control-panel.yaml', { eager: true, query: '?raw', import: 'default' })
const generalConfigs = import.meta.glob('../../config.yaml', { eager: true, query: '?raw', import: 'default' })

let yamlConfigFile = null
let configSource = 'none'

// Check project config first
if (Object.keys(projectConfigs).length > 0) {
  yamlConfigFile = Object.values(projectConfigs)[0]
  configSource = 'project (../../configs/config-control-panel.yaml)'
  console.log('Loaded project config from ../../configs/config-control-panel.yaml')
} else if (Object.keys(generalConfigs).length > 0) {
  yamlConfigFile = Object.values(generalConfigs)[0]
  configSource = 'general (config.yaml)'
  console.log('Loaded general config from config.yaml')
} else {
  console.log('No config file found, using defaults')
}

// Hardcoded defaults (Level 2 - lowest priority)
const DEFAULTS = {
  projectName: 'u106_multi_account_algo_trading',
  ports: {
    vite: 7106,
    websocket: 6106,
    api: 5106
  },
  websocket: {
    url: 'ws://127.0.0.1:6106',
    reconnect: {
      initialDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2
    }
  },
  api: {
    baseUrl: 'http://127.0.0.1:5106',
    endpoints: {
      sendRequest: '/api/send-request'
    }
  },
  messageTypes: {
    applicationState: 'application_state',
    appConfig: 'app_config'
  }
}

// Load YAML config (Level 1 - highest priority)
const yamlConfig = yamlConfigFile?.control_panel || {}

// Merge function to combine configurations
function mergeConfig(defaults, yaml) {
  return {
    projectName: yaml.projectName || defaults.projectName,
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
    }
  }
}

// Final merged configuration
export const loadedConfig = mergeConfig(DEFAULTS, yamlConfig)

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
