# Git Submodule Usage Guide

## Using This Dashboard as a Git Submodule

This control panel is designed to be reusable across multiple projects via Git submodules.

### Initial Setup

1. **Create the dashboard repository (one time):**
   ```bash
   cd apps/ui-dashboard
   git init
   git add .
   git commit -m "Initial commit: Reusable control panel dashboard"
   git remote add origin <your-dashboard-repo-url>
   git push -u origin main
   ```

2. **Add as submodule in other projects:**
   ```bash
   # In your new project directory
   git submodule add <dashboard-repo-url> apps/ui-dashboard
   git submodule update --init --recursive
   ```

### Configuration per Project

#### Option 1: Environment Variables (Recommended)

Each project creates its own `.env.local` file:

```bash
# Copy the example file
cp apps/ui-dashboard/.env.example apps/ui-dashboard/.env.local

# Edit .env.local for your project
VITE_PROJECT_NAME=your_project_name
VITE_WS_URL=ws://127.0.0.1:YOUR_WS_PORT
VITE_API_URL=http://127.0.0.1:YOUR_API_PORT
```

**Benefits:**
- ✅ No need to modify `appConfig.js`
- ✅ `.env.local` is gitignored (project-specific)
- ✅ Easy to switch between environments
- ✅ Perfect for submodule usage

#### Option 2: Project Configuration File

Add your project to `src/config/appConfig.js`:

```javascript
const projects = {
  u106_multi_account_algo_trading: { /* existing */ },
  
  your_project_name: {
    name: 'Your Project Display Name',
    websocket: {
      url: import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8080',
      reconnect: {
        initialDelay: 1000,
        maxDelay: 30000,
        backoffMultiplier: 2
      }
    },
    api: {
      baseUrl: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
      endpoints: {
        sendRequest: '/api/send-request'
      }
    },
    messageTypes: {
      applicationState: 'application_state',
      appConfig: 'app_config'
    }
  }
}

const ACTIVE_PROJECT = import.meta.env.VITE_PROJECT_NAME || 'your_project_name'
```

### Running the Dashboard

```bash
cd apps/ui-dashboard

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Or with custom environment variables
VITE_WS_URL=ws://localhost:9000 VITE_API_URL=http://localhost:9001 npm run dev
```

### Updating the Dashboard Across Projects

```bash
# In any project using the dashboard submodule
cd apps/ui-dashboard
git pull origin main
cd ../..
git add apps/ui-dashboard
git commit -m "Update dashboard submodule"
```

### Project Structure Example

```
your-project/
├── .git/
├── apps/
│   └── ui-dashboard/          # Git submodule
│       ├── .env.local         # Project-specific config (gitignored)
│       ├── .env.example       # Template for configuration
│       └── src/
│           └── config/
│               └── appConfig.js
├── backend/
├── scripts/
└── README.md
```

### Best Practices

1. **Keep `.env.local` out of version control:**
   - Already configured in `.gitignore`
   - Each developer/deployment creates their own

2. **Use environment variables for deployment:**
   ```bash
   # Production deployment
   VITE_WS_URL=wss://prod.example.com:6106 \
   VITE_API_URL=https://api.example.com \
   npm run build
   ```

3. **Version pinning:**
   ```bash
   # Pin to specific dashboard version
   cd apps/ui-dashboard
   git checkout v1.0.0
   cd ../..
   git add apps/ui-dashboard
   git commit -m "Pin dashboard to v1.0.0"
   ```

4. **Testing changes before committing to main dashboard:**
   ```bash
   # Work in a branch within the submodule
   cd apps/ui-dashboard
   git checkout -b feature/new-page
   # Make changes, test
   git commit -m "Add new feature"
   git push origin feature/new-page
   # Create PR to main dashboard repo
   ```

### Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_PROJECT_NAME` | Project identifier in appConfig.js | `u106_multi_account_algo_trading` |
| `VITE_WS_URL` | WebSocket server URL | `ws://127.0.0.1:6106` |
| `VITE_API_URL` | API server base URL | `http://127.0.0.1:5106` |

### Multiple Projects Example

**Project A:**
```bash
# apps/ui-dashboard/.env.local
VITE_PROJECT_NAME=project_a
VITE_WS_URL=ws://127.0.0.1:6001
VITE_API_URL=http://127.0.0.1:5001
```

**Project B:**
```bash
# apps/ui-dashboard/.env.local
VITE_PROJECT_NAME=project_b
VITE_WS_URL=ws://127.0.0.1:6002
VITE_API_URL=http://127.0.0.1:5002
```

Same dashboard code, different configurations! 🚀
