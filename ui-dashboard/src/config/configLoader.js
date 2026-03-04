/**
 * Configuration Loader
 * Loads config from Vite dev server API endpoint
 * Priority: project config → general config → defaults
 */

// ...existing code...

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

// ...existing code...

// Final configuration: throw error if not loaded
if (!yamlConfig || Object.keys(yamlConfig).length === 0) {
  throw new Error('Configuration could not be loaded from file or API.');
}
export const loadedConfig = yamlConfig;

// Export config source for display
export const configMetadata = {
  source: configSource,
  hasYaml: Object.keys(yamlConfig).length > 0,
  usingDefaults: false
}

// Log configuration source for debugging
if (import.meta.env.DEV) {
  console.log('Configuration loaded:', {
    sources: {
      configFile: configSource,
      yaml: Object.keys(yamlConfig).length > 0 ? 'loaded' : 'none'
    },
    config: loadedConfig
  })
}

export default loadedConfig
