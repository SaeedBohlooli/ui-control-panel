/**
 * Configuration Loader
 * Three-level configuration hierarchy:
 * 1. Environment variables (.env files) - highest priority
 * 2. YAML config file (config.yaml) - medium priority
 * 3. Hardcoded defaults - lowest priority
 */

import yamlConfigFile from '../../config.yaml'

// Hardcoded defaults (Level 3 - lowest priority)
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

// Load YAML config (Level 2 - medium priority)
const yamlConfig = yamlConfigFile || {}

// Merge function to combine configurations
function mergeConfig(defaults, yaml, env) {
  return {
    projectName: env.projectName || yaml.projectName || defaults.projectName,
    ports: {
      vite: env.ports?.vite || yaml.ports?.vite || defaults.ports.vite,
      websocket: env.ports?.websocket || yaml.ports?.websocket || defaults.ports.websocket,
      api: env.ports?.api || yaml.ports?.api || defaults.ports.api
    },
    websocket: {
      url: env.websocket?.url || yaml.websocket?.url || defaults.websocket.url,
      reconnect: {
        initialDelay: env.websocket?.reconnect?.initialDelay || yaml.websocket?.reconnect?.initialDelay || defaults.websocket.reconnect.initialDelay,
        maxDelay: env.websocket?.reconnect?.maxDelay || yaml.websocket?.reconnect?.maxDelay || defaults.websocket.reconnect.maxDelay,
        backoffMultiplier: env.websocket?.reconnect?.backoffMultiplier || yaml.websocket?.reconnect?.backoffMultiplier || defaults.websocket.reconnect.backoffMultiplier
      }
    },
    api: {
      baseUrl: env.api?.baseUrl || yaml.api?.baseUrl || defaults.api.baseUrl,
      endpoints: {
        sendRequest: env.api?.endpoints?.sendRequest || yaml.api?.endpoints?.sendRequest || defaults.api.endpoints.sendRequest
      }
    },
    messageTypes: {
      applicationState: env.messageTypes?.applicationState || yaml.messageTypes?.applicationState || defaults.messageTypes.applicationState,
      appConfig: env.messageTypes?.appConfig || yaml.messageTypes?.appConfig || defaults.messageTypes.appConfig
    }
  }
}

// Load environment variables (Level 1 - highest priority)
const envConfig = {
  projectName: import.meta.env.VITE_PROJECT_NAME,
  ports: {
    vite: import.meta.env.VITE_PORT ? parseInt(import.meta.env.VITE_PORT) : undefined,
    websocket: import.meta.env.VITE_WS_PORT ? parseInt(import.meta.env.VITE_WS_PORT) : undefined,
    api: import.meta.env.VITE_API_PORT ? parseInt(import.meta.env.VITE_API_PORT) : undefined
  },
  websocket: {
    url: import.meta.env.VITE_WS_URL,
    reconnect: {
      initialDelay: import.meta.env.VITE_WS_RECONNECT_INITIAL ? parseInt(import.meta.env.VITE_WS_RECONNECT_INITIAL) : undefined,
      maxDelay: import.meta.env.VITE_WS_RECONNECT_MAX ? parseInt(import.meta.env.VITE_WS_RECONNECT_MAX) : undefined,
      backoffMultiplier: import.meta.env.VITE_WS_RECONNECT_MULTIPLIER ? parseFloat(import.meta.env.VITE_WS_RECONNECT_MULTIPLIER) : undefined
    }
  },
  api: {
    baseUrl: import.meta.env.VITE_API_URL
  }
}

// Final merged configuration
export const loadedConfig = mergeConfig(DEFAULTS, yamlConfig, envConfig)

// Log configuration source for debugging
if (import.meta.env.DEV) {
  console.log('Configuration loaded:', {
    sources: {
      env: Object.keys(envConfig).filter(k => envConfig[k] !== undefined).length > 0 ? 'loaded' : 'none',
      yaml: Object.keys(yamlConfig).length > 0 ? 'loaded' : 'none',
      defaults: 'active'
    },
    config: loadedConfig
  })
}

export default loadedConfig
