# Configuration Guide

This application uses a three-level configuration system that provides flexibility for different deployment scenarios.

## Configuration Hierarchy

The configuration is loaded in the following priority order (highest to lowest):

1. **Environment Variables** (.env files) - **HIGHEST PRIORITY**
2. **YAML Configuration File** (config.yaml) - **MEDIUM PRIORITY**
3. **Hardcoded Defaults** - **LOWEST PRIORITY**

## Quick Start

### Option 1: Using Environment Variables (Recommended for Development)

```powershell
# Copy the example file
Copy-Item .env.example .env.local

# Edit .env.local with your custom values
# Then start the dev server
npm run dev
```

### Option 2: Using YAML Configuration

```powershell
# Copy the example file
Copy-Item config.yaml.example config.yaml

# Edit config.yaml with your custom values
# Then start the dev server
npm run dev
```

### Option 3: Using Defaults

Simply run the application without any configuration files. It will use the hardcoded defaults.

```powershell
npm run dev
```

## Configuration Files

### .env.local (Highest Priority)

Environment variables override all other configuration sources. Supported variables:

- `VITE_PROJECT_NAME` - Project identifier
- `VITE_PORT` - Vite dev server port (default: 7106)
- `VITE_WS_URL` - WebSocket server URL
- `VITE_WS_PORT` - WebSocket server port
- `VITE_API_URL` - API server URL
- `VITE_API_PORT` - API server port
- `VITE_WS_RECONNECT_INITIAL` - Initial reconnection delay in ms
- `VITE_WS_RECONNECT_MAX` - Maximum reconnection delay in ms
- `VITE_WS_RECONNECT_MULTIPLIER` - Reconnection backoff multiplier

### config.yaml (Medium Priority)

YAML configuration file for structured settings. See `config.yaml.example` for the full structure.

### Hardcoded Defaults (Lowest Priority)

Defined in `src/config/configLoader.js`. These are used when no other configuration is provided.

## Examples

### Example 1: Override Only the Port

Create `.env.local`:
```env
VITE_PORT=8080
```

All other values will come from `config.yaml` (if exists) or defaults.

### Example 2: Different Environment Setup

Create `config.yaml`:
```yaml
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

### Example 3: Override YAML with Environment Variable

If you have `config.yaml` with port 9000, but want to temporarily use 8080:

```powershell
$env:VITE_PORT=8080; npm run dev
```

The environment variable takes precedence.

## Best Practices

1. **Never commit `.env.local`** - This file is git-ignored and contains local development settings
2. **Use `config.yaml` for team defaults** - Commit this file if your team shares common settings
3. **Use `.env.local` for personal overrides** - Each developer can customize their local environment
4. **Document custom variables** - Add comments in example files when adding new configuration options

## Troubleshooting

### Check Which Configuration Is Loaded

In development mode, open the browser console. You'll see a log showing which configuration sources were loaded:

```javascript
Configuration loaded: {
  sources: { env: 'loaded', yaml: 'loaded', defaults: 'active' },
  config: { ... }
}
```

### Port Already in Use

If you get a port conflict error:

1. Change the port in `.env.local`: `VITE_PORT=8080`
2. Or set it temporarily: `$env:VITE_PORT=8080; npm run dev`

### YAML Syntax Errors

Make sure your `config.yaml` follows proper YAML syntax:
- Use spaces for indentation (not tabs)
- Maintain consistent indentation levels
- Quote strings with special characters

## Migration from Old Configuration

If you were using the old `appConfig.js` directly, your existing `.env` files will continue to work. The new system is backward compatible.
