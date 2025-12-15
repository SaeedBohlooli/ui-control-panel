import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import yaml from '@rollup/plugin-yaml'
import fs from 'fs'
import path from 'path'
import yamlParser from 'js-yaml'

// Load config.yaml to get the port
// Priority: ../../configs/config-control-panel.yaml (project) > ./config.yaml (general) > default
let vitePort = 7106 // default
let loadedConfigData = null
const projectConfigPath = path.resolve(__dirname, '../../configs/config-control-panel.yaml')
const generalConfigPath = path.resolve(__dirname, './config.yaml')

try {
  let configFile
  if (fs.existsSync(projectConfigPath)) {
    configFile = fs.readFileSync(projectConfigPath, 'utf8')
    loadedConfigData = yamlParser.load(configFile)
    console.log('Using project config from ../../configs/config-control-panel.yaml')
  } else if (fs.existsSync(generalConfigPath)) {
    configFile = fs.readFileSync(generalConfigPath, 'utf8')
    loadedConfigData = yamlParser.load(configFile)
    console.log('Using general config from ./config.yaml')
  }
  
  if (loadedConfigData) {
    vitePort = loadedConfigData?.control_panel?.ports?.vite || 7106
  }
} catch (e) {
  console.log('Could not load config, using default port 7106')
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    yaml(),
    // Custom plugin to serve config via API
    {
      name: 'config-server',
      configureServer(server) {
        server.middlewares.use('/api/config', (req, res) => {
          res.setHeader('Content-Type', 'application/json')
          let configData = null
          let source = 'none'
          
          if (fs.existsSync(projectConfigPath)) {
            const configFile = fs.readFileSync(projectConfigPath, 'utf8')
            configData = yamlParser.load(configFile)
            source = 'project'
          } else if (fs.existsSync(generalConfigPath)) {
            const configFile = fs.readFileSync(generalConfigPath, 'utf8')
            configData = yamlParser.load(configFile)
            source = 'general'
          }
          
          res.end(JSON.stringify({
            config: configData?.control_panel || null,
            source: source
          }))
        })
      }
    }
  ],
  server: {
    port: vitePort,
    strictPort: true,
  }
})
