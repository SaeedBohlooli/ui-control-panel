/**
 * Application Configuration
 * Centralized configuration for all projects and services
 * 
 * Configuration hierarchy (highest to lowest priority):
 * 1. Environment variables (.env files)
 * 2. YAML config file (config.yaml)
 * 3. Hardcoded defaults
 */

import { loadedConfig } from './configLoader'

// Project configurations - easily add new projects here
const projects = {
  u106_multi_account_algo_trading: {
    name: 'p106 Multi Account Algo Trading',
    websocket: {
      url: loadedConfig.websocket.url,
      reconnect: loadedConfig.websocket.reconnect
    },
    api: {
      baseUrl: loadedConfig.api.baseUrl,
      endpoints: loadedConfig.api.endpoints
    },
    messageTypes: loadedConfig.messageTypes
  }
  // Add more projects here as needed:
  // project_name: {
  //   name: 'Project Display Name',
  //   websocket: { 
  //     url: import.meta.env.VITE_WS_URL || 'ws://...',
  //     reconnect: { initialDelay: 1000, maxDelay: 30000, backoffMultiplier: 2 }
  //   },
  //   api: { 
  //     baseUrl: import.meta.env.VITE_API_URL || 'http://...',
  //     endpoints: { sendRequest: '/api/send-request' }
  //   }
  // }
}

// Current active project
// Can be overridden with VITE_PROJECT_NAME environment variable
const ACTIVE_PROJECT = loadedConfig.projectName

// Export the active project configuration
export const config = projects[ACTIVE_PROJECT]

// Export all projects for multi-project dashboard (future use)
export const allProjects = projects

// Helper functions
export const getWebSocketUrl = () => config.websocket.url

export const getApiUrl = (endpoint = '') => {
  if (endpoint.startsWith('/')) {
    return `${config.api.baseUrl}${endpoint}`
  }
  return `${config.api.baseUrl}/${endpoint}`
}

export const getApiEndpoint = (endpointKey) => {
  return config.api.endpoints[endpointKey] || endpointKey
}

export const getFullApiUrl = (endpointKey) => {
  const endpoint = getApiEndpoint(endpointKey)
  return getApiUrl(endpoint)
}

export const getReconnectConfig = () => config.websocket.reconnect

export const getMessageType = (typeKey) => {
  return config.messageTypes[typeKey]
}

// Export project name for page titles
export const PROJECT_NAME = config.name

export default config
