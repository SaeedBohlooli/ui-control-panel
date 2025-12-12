import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import Home from './pages/Home'
import WebSocketPage from './pages/WebSocketPage'
import OpenPositionsPage from './pages/OpenPositionsPage'
import AccountSummaryPage from './pages/AccountSummaryPage'
import ApplicationStateDetailsPage from './pages/ApplicationStateDetailsPage'

function App() {
  const [count, setCount] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user was previously authenticated
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
    localStorage.setItem('isAuthenticated', 'true')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('isAuthenticated')
  }

  const appState = { count, onLogout: handleLogout }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Home count={count} onIncrement={() => setCount((c) => c + 1)} onLogout={handleLogout} />}
      />
      <Route
        path="/application_state"
        element={<WebSocketPage title="Application state" messageType="application_state" state={appState} />}
      />
      <Route
        path="/application_state_details"
        element={<ApplicationStateDetailsPage state={appState} />}
      />
      <Route
        path="/application_config"
        element={<WebSocketPage title="Application config" messageType="app_config" state={appState} />}
      />
      <Route
        path="/open_positions"
        element={<OpenPositionsPage state={appState} />}
      />
      <Route
        path="/account_summary"
        element={<AccountSummaryPage state={appState} />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
