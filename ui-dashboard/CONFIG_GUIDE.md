# Configuration Guide

This application uses a two-level configuration system using YAML files.

## Configuration Hierarchy

The configuration is loaded in the following priority order (highest to lowest):

1. **YAML Configuration File** (config.yaml) - **HIGHEST PRIORITY**
2. **Hardcoded Defaults** (in src/config/configLoader.js) - **LOWEST PRIORITY**

## Quick Start

### Setup Configuration

```powershell
# Copy the example file
Copy-Item config.yaml.example config.yaml

# Edit config.yaml with your custom values
# Then start the dev server
npm run dev
```

### Using Defaults

Simply run the application without a config.yaml file. It will use the hardcoded defaults.

```powershell
npm run dev
```

## Configuration File

### config.yaml

YAML configuration file for all application settings. See `config.yaml.example` for the full structure.

**Structure:**
```yaml
control_panel:
  projectName: u106_multi_account_algo_trading
  
  ports:
    vite: 7106
    websocket: 6106
    api: 5106
  
  websocket:
    url: ws://127.0.0.1:6106
    reconnect:
      initialDelay: 1000
      maxDelay: 30000
      backoffMultiplier: 2
  
  api:
    baseUrl: http://127.0.0.1:5106
    endpoints:
      sendRequest: /api/send-request
  
  messageTypes:
    applicationState: application_state
    appConfig: app_config
```

### Hardcoded Defaults

Defined in `src/config/configLoader.js`. These are used when no config.yaml is provided or when specific values are missing from the YAML file.

## Examples

### Example 1: Custom Ports

Edit `config.yaml`:
```yaml
control_panel:
  projectName: u106_multi_account_algo_trading
  ports:
    vite: 9000
    websocket: 9001
    api: 9002
  websocket:
    url: ws://localhost:9001
  api:
    baseUrl: http://localhost:9002
```

### Example 2: Different Reconnection Settings

Edit `config.yaml`:
```yaml
control_panel:
  websocket:
    url: ws://127.0.0.1:6106
    reconnect:
      initialDelay: 2000
      maxDelay: 60000
      backoffMultiplier: 1.5
```

## Best Practices

1. **Commit `config.yaml.example`** - This serves as documentation for available settings
2. **Add `config.yaml` to .gitignore** - Keep your local configuration private (if needed)
3. **Use comments** - Document custom settings in your config.yaml
4. **Validate YAML syntax** - Use proper YAML syntax to avoid parsing errors

## Troubleshooting

### Check Which Configuration Is Loaded

In development mode, open the browser console. You'll see a log showing which configuration sources were loaded:

```javascript
Configuration loaded: {
  sources: { yaml: 'loaded', defaults: 'active' },
  config: { ... }
}
```

### Port Already in Use

If you get a port conflict error:

1. Change the port in `config.yaml`:
```yaml
control_panel:
  ports:
    vite: 8080
```

2. Restart the dev server

### YAML Syntax Errors

Make sure your `config.yaml` follows proper YAML syntax:
- Use spaces for indentation (not tabs)
- Maintain consistent indentation levels (2 spaces recommended)
- Quote strings with special characters
- Ensure proper nesting under `control_panel:`

### Configuration Not Loading

If changes to `config.yaml` aren't being picked up:
1. Stop the dev server
2. Delete `node_modules/.vite` cache
3. Restart the dev server
