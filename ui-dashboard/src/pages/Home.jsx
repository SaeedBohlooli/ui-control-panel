import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Home({ onLogout }) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="home" style={{ minHeight: '100vh', padding: 40, position: 'relative' }}>
      <div style={{ 
        position: 'absolute', 
        top: 20, 
        right: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <div style={{ 
          fontSize: 18, 
          color: '#666', 
          fontFamily: 'monospace',
          background: '#f3f4f6',
          padding: '8px 16px',
          borderRadius: 6,
          border: '1px solid #e5e7eb'
        }}>
          {currentTime.toLocaleTimeString()}
        </div>
        <button
          onClick={onLogout}
          style={{
            padding: '8px 16px',
            fontSize: 14,
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: '500'
          }}
          onMouseEnter={(e) => e.target.style.background = '#dc2626'}
          onMouseLeave={(e) => e.target.style.background = '#ef4444'}
        >
          Logout
        </button>
      </div>
      <h1 style={{ marginBottom: 40, fontSize: 32 }}>Trading Dashboard</h1>
      
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, marginBottom: 16, color: '#333' }}>Monitor</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/application_state">
            <button style={{ 
              padding: '12px 24px', 
              fontSize: 16,
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer'
            }}>
              Application State
            </button>
          </Link>
          <Link to="/application_state_details">
            <button style={{ 
              padding: '12px 24px', 
              fontSize: 16,
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer'
            }}>
              Application State Details
            </button>
          </Link>
          <Link to="/application_config">
            <button style={{ 
              padding: '12px 24px', 
              fontSize: 16,
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer'
            }}>
              Application Config
            </button>
          </Link>
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, marginBottom: 16, color: '#333' }}>Trading</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/open_positions">
            <button style={{ 
              padding: '12px 24px', 
              fontSize: 16,
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer'
            }}>
              Open Positions
            </button>
          </Link>
          <Link to="/open_orders">
            <button style={{ 
              padding: '12px 24px', 
              fontSize: 16,
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer'
            }}>
              Open Orders
            </button>
          </Link>
          <Link to="/account_summary">
            <button style={{ 
              padding: '12px 24px', 
              fontSize: 16,
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer'
            }}>
              Account Summary
            </button>
          </Link>
        </div>
      </div>

      <footer style={{ 
        marginTop: 80, 
        paddingTop: 20, 
        borderTop: '1px solid #e5e7eb',
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: 14
      }}>
        <p style={{ margin: 0 }}>Multi-Account Algo Trading Dashboard</p>
        <p style={{ margin: '8px 0 0 0' }}>© {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}

export default Home
