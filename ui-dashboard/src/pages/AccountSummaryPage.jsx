import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import PageFooter from '../components/PageFooter'
import { getWebSocketUrl, getReconnectConfig } from '../config/appConfig'

function AccountSummaryPage() {
  const [wsData, setWsData] = useState(null)
  const [status, setStatus] = useState('disconnected')
  const [lastReceived, setLastReceived] = useState(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [retryTimeout, setRetryTimeout] = useState(null)
  const wsRef = useRef(null)
  const retryTimeoutRef = useRef(null)
  const [sortConfig, setSortConfig] = useState({ key: 'field', direction: 'asc' })

  const connectWs = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
      setRetryTimeout(null)
    }

    let mounted = true
    try {
      const ws = new WebSocket(getWebSocketUrl())
      wsRef.current = ws

      ws.onopen = () => {
        if (!mounted) return
        setStatus('connected')
        setRetryCount(0)
      }

      ws.onmessage = (ev) => {
        if (!mounted) return
        const raw = ev.data
        try {
          const parsed = JSON.parse(raw)
          if (parsed.type === 'application_state') {
            setLastReceived(Date.now())
            setWsData(parsed)
          }
        } catch (e) {
          // ignore non-JSON messages
        }
      }

      ws.onerror = (err) => {
        if (!mounted) return
        setStatus('error')
        console.error('WebSocket error', err)
      }

      ws.onclose = () => {
        if (!mounted) return
        setStatus('closed')
        const reconnectConfig = getReconnectConfig()
        const nextRetry = Math.min(
          reconnectConfig.initialDelay * Math.pow(reconnectConfig.backoffMultiplier, retryCount),
          reconnectConfig.maxDelay
        )
        setRetryTimeout(nextRetry)
        retryTimeoutRef.current = setTimeout(() => {
          if (mounted) {
            setRetryCount((c) => c + 1)
            connectWs()
          }
        }, nextRetry)
      }
    } catch (err) {
      setStatus('error')
      console.error('WebSocket failed to construct', err)
      const reconnectConfig = getReconnectConfig()
      const nextRetry = Math.min(
        reconnectConfig.initialDelay * Math.pow(reconnectConfig.backoffMultiplier, retryCount),
        reconnectConfig.maxDelay
      )
      setRetryTimeout(nextRetry)
      retryTimeoutRef.current = setTimeout(() => {
        if (mounted) {
          setRetryCount((c) => c + 1)
          connectWs()
        }
      }, nextRetry)
    }

    return () => {
      mounted = false
    }
  }

  useEffect(() => {
    connectWs()
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      try {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close()
        }
      } catch (e) {
        // ignore
      }
    }
  }, [])

  useEffect(() => {
    if (!lastReceived) {
      setElapsedSeconds(null)
      return
    }
    setElapsedSeconds(Math.floor((Date.now() - lastReceived) / 1000))
    const id = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - lastReceived) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [lastReceived])

  const accountInfo = wsData?.data?.['account_info'] || wsData?.['account_info'] || null

  const handleSort = (column) => {
    setSortConfig((prev) => ({
      key: column,
      direction: prev.key === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const sortedEntries = accountInfo ? Object.entries(accountInfo).sort((a, b) => {
    if (sortConfig.key === 'field') {
      const aStr = a[0].toLowerCase()
      const bStr = b[0].toLowerCase()
      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    } else {
      // Sort by value
      const aVal = a[1]
      const bVal = b[1]
      
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
      }
      
      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      
      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    }
  }) : []

  return (
    <div className="state-page">
      <PageHeader 
        title="Account Summary"
        status={status}
        lastReceived={lastReceived}
        elapsedSeconds={elapsedSeconds}
        retryTimeout={retryTimeout}
        retryCount={retryCount}
        onReconnect={() => {
          setRetryCount(0)
          connectWs()
        }}
      />

      {accountInfo ? (
        <div style={{ marginBottom: 20 }}>
          <h3>Account Information</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16, background: '#fff', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ccc', background: '#f5f5f5' }}>
                <th 
                  onClick={() => handleSort('field')}
                  style={{ 
                    padding: 10, 
                    textAlign: 'left', 
                    width: '30%',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  Field
                  {sortConfig.key === 'field' && (
                    <span style={{ marginLeft: 6 }}>
                      {sortConfig.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
                <th 
                  onClick={() => handleSort('value')}
                  style={{ 
                    padding: 10, 
                    textAlign: 'left',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  Value
                  {sortConfig.key === 'value' && (
                    <span style={{ marginLeft: 6 }}>
                      {sortConfig.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map(([key, value]) => (
                <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 10, fontWeight: 'bold', color: '#555' }}>{key}</td>
                  <td style={{ padding: 10 }}>
                    {typeof value === 'object' && value !== null ? (
                      <pre style={{ margin: 0, fontSize: 14 }}>{JSON.stringify(value, null, 2)}</pre>
                    ) : typeof value === 'number' ? (
                      value.toLocaleString('en-US', { maximumFractionDigits: 2 })
                    ) : (
                      String(value)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ marginBottom: 20 }}>
          <p style={{ color: '#666' }}>No account information available</p>
          {wsData && (
            <details style={{ marginTop: 10, background: '#f6f8fa', padding: 12, borderRadius: 6 }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Debug: View raw data</summary>
              <pre style={{ marginTop: 10, fontSize: 12 }}>{JSON.stringify(wsData, null, 2)}</pre>
            </details>
          )}
        </div>
      )}

      <Link to="/">
        <button>Back</button>
      </Link>
      
      <PageFooter />
    </div>
  )
}

export default AccountSummaryPage
