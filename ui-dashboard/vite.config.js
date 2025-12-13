import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import yaml from '@rollup/plugin-yaml'
import fs from 'fs'
import path from 'path'
import yamlParser from 'js-yaml'

// Load config.yaml to get the port
// Priority: ../../configs/config-control-panel.yaml (project) > ./config.yaml (general) > default
let vitePort = 7106 // default
const projectConfigPath = path.resolve(__dirname, '../../configs/config-control-panel.yaml')
const generalConfigPath = path.resolve(__dirname, './config.yaml')

try {
  let configFile
  if (fs.existsSync(projectConfigPath)) {
    configFile = fs.readFileSync(projectConfigPath, 'utf8')
    console.log('Using project config from ../../configs/config-control-panel.yaml')
  } else if (fs.existsSync(generalConfigPath)) {
    configFile = fs.readFileSync(generalConfigPath, 'utf8')
    console.log('Using general config from ./config.yaml')
  }
  
  if (configFile) {
    const config = yamlParser.load(configFile)
    vitePort = config?.control_panel?.ports?.vite || 7106
  }
} catch (e) {
  console.log('Could not load config, using default port 7106')
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), yaml()],
  server: {
    port: vitePort,
    strictPort: true,
  },
})
