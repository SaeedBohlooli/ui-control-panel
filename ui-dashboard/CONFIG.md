# Configuration Guide

## Overview

All hardcoded URLs and settings have been centralized in `src/config/appConfig.js` to make this dashboard reusable across multiple projects.

## Configuration Methods

### Method 1: Environment Variables (Recommended for Git Submodules)

Create a `.env.local` file (already gitignored):

```bash
# Copy the example
cp .env.example .env.local

# Edit .env.local
VITE_PROJECT_NAME=your_project_name
VITE_WS_URL=ws://127.0.0.1:8080
VITE_API_URL=http://127.0.0.1:8000
```

**Benefits:**
- ✅ No code changes needed
- ✅ Project-specific settings stay local
- ✅ Perfect for Git submodule usage
- ✅ Easy environment switching

### Method 2: Configuration File

Edit `src/config/appConfig.js` directly (see sections below).

## Configuration Structure

### Location
`src/config/appConfig.js`

### Adding a New Project

To add a new project to the control panel:

```javascript
const projects = {
  // Existing project
  u106_multi_account_algo_trading: { ... },
  
  // Add your new project here
  your_project_name: {
    name: 'Your Project Display Name',
    websocket: {
      url: 'ws://127.0.0.1:PORT',
      reconnect: {
        initialDelay: 1000,        // Start with 1 second
        maxDelay: 30000,           // Max 30 seconds
        backoffMultiplier: 2       // Double delay each retry
      }
    },
    api: {
      baseUrl: 'http://127.0.0.1:PORT',
      endpoints: {
        sendRequest: '/api/send-request',
        // Add more endpoints as needed
        getStatus: '/api/status',
        getConfig: '/api/config'
      }
    },
    messageTypes: {
      applicationState: 'application_state',
      appConfig: 'app_config',
      // Add more message types as needed
    }
  }
}
```

### Switching Between Projects

Change the `ACTIVE_PROJECT` constant:

```javascript
const ACTIVE_PROJECT = 'your_project_name'  // Change this line
```

## Available Helper Functions

### WebSocket Configuration

```javascript
import { getWebSocketUrl, getReconnectConfig } from '../config/appConfig'

// Get WebSocket URL
const wsUrl = getWebSocketUrl()  // Returns: 'ws://127.0.0.1:6106'

// Get reconnect configuration
const reconnectConfig = getReconnectConfig()
// Returns: { initialDelay: 1000, maxDelay: 30000, backoffMultiplier: 2 }
```

### API Configuration

```javascript
import { getApiUrl, getFullApiUrl, getApiEndpoint } from '../config/appConfig'

// Get base API URL
const baseUrl = getApiUrl()  // Returns: 'http://127.0.0.1:5106'

// Get full URL for a specific endpoint
const url = getFullApiUrl('sendRequest')  // Returns: 'http://127.0.0.1:5106/api/send-request'

// Get endpoint path only
const endpoint = getApiEndpoint('sendRequest')  // Returns: '/api/send-request'

// Build custom URL
const customUrl = getApiUrl('/custom/path')  // Returns: 'http://127.0.0.1:5106/custom/path'
```

### Message Types

```javascript
import { getMessageType } from '../config/appConfig'

const msgType = getMessageType('applicationState')  // Returns: 'application_state'
```

### Project Information

```javascript
import { PROJECT_NAME, config, allProjects } from '../config/appConfig'

// Get current project display name
console.log(PROJECT_NAME)  // 'p106 Multi Account Algo Trading'

// Access full config
console.log(config.websocket.url)

// Access all projects (for multi-project dashboard)
console.log(Object.keys(allProjects))  // ['u106_multi_account_algo_trading', ...]
```

## Usage Examples

### Creating a WebSocket Connection

```javascript
import { getWebSocketUrl, getReconnectConfig } from '../config/appConfig'

const connectWs = () => {
  const ws = new WebSocket(getWebSocketUrl())
  
  ws.onclose = () => {
    const reconnectConfig = getReconnectConfig()
    const nextRetry = Math.min(
      reconnectConfig.initialDelay * Math.pow(reconnectConfig.backoffMultiplier, retryCount),
      reconnectConfig.maxDelay
    )
    // Retry logic...
  }
}
```

### Making API Calls

```javascript
import { getFullApiUrl } from '../config/appConfig'

const sendRequest = async (data) => {
  const response = await fetch(getFullApiUrl('sendRequest'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return response.json()
}
```

## Future Enhancements

### Multi-Project Dashboard

The configuration is designed to support multiple projects. You can:

1. Add multiple project configurations
2. Create a project selector component
3. Allow users to switch between projects at runtime
4. Display multiple projects simultaneously in different tabs/views

Example multi-project selector:

```javascript
import { allProjects } from '../config/appConfig'

function ProjectSelector() {
  return (
    <select onChange={(e) => switchProject(e.target.value)}>
      {Object.entries(allProjects).map(([key, project]) => (
        <option key={key} value={key}>{project.name}</option>
      ))}
    </select>
  )
}
```

## Environment Variables

For production deployments, consider using environment variables:

1. Create `.env` file:
```
VITE_WS_URL=ws://production.server.com:6106
VITE_API_URL=http://production.server.com:5106
```

2. Update `appConfig.js`:
```javascript
const projects = {
  u106_multi_account_algo_trading: {
    websocket: {
      url: import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:6106',
    },
    api: {
      baseUrl: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5106',
    }
  }
}
```

## Benefits

✅ **Single Source of Truth** - All URLs and settings in one place  
✅ **Easy Project Switching** - Change one variable to switch entire configuration  
✅ **Multi-Project Support** - Built-in support for managing multiple projects  
✅ **Type-Safe** - Helper functions prevent typos in URLs  
✅ **Maintainable** - Easy to update ports, URLs, and settings  
✅ **Scalable** - Ready for environment-specific configurations  
