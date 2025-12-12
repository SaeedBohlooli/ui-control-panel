import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import PageFooter from '../components/PageFooter'
import { getWebSocketUrl, getReconnectConfig } from '../config/appConfig'

function ApplicationStateDetailsPage() {
  const [wsData, setWsData] = useState(null)
  const [status, setStatus] = useState('disconnected')
  const [lastReceived, setLastReceived] = useState(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [retryTimeout, setRetryTimeout] = useState(null)
  const wsRef = useRef(null)
  const retryTimeoutRef = useRef(null)

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

  const dataObj = wsData?.data || {}

  // Function to check if value is an array of objects
  const isArrayOfObjects = (value) => {
    return Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null
  }

  return (
    <div className="state-page">
      <PageHeader 
        title="Application State Details"
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

      {Object.keys(dataObj).length > 0 ? (
        <div>
          {Object.entries(dataObj).map(([key, value]) => (
            <div key={key} style={{ marginBottom: 30 }}>
              <h3 style={{ marginBottom: 12, color: '#333' }}>{key}</h3>
              {isArrayOfObjects(value) ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16, background: '#fff', border: '1px solid #ddd' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #ccc', background: '#f5f5f5' }}>
                      {Object.keys(value[0]).map((colKey) => (
                        <th key={colKey} style={{ padding: 10, textAlign: 'left' }}>{colKey}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {value.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        {Object.entries(item).map(([colKey, colValue]) => (
                          <td key={colKey} style={{ padding: 10 }}>
                            {typeof colValue === 'object' && colValue !== null ? 
                              JSON.stringify(colValue) : 
                              typeof colValue === 'number' ?
                              colValue.toLocaleString('en-US', { maximumFractionDigits: 2 }) :
                              String(colValue)
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{whiteSpace: 'pre-wrap', background: '#f6f8fa', padding: 12, borderRadius: 6}}>
                  <pre style={{ textAlign: 'left', fontSize: 14 }}>{JSON.stringify(value, null, 2)}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ marginBottom: 20 }}>
          <p style={{ color: '#666' }}>No data available</p>
        </div>
      )}

      <Link to="/">
        <button>Back</button>
      </Link>
      
      <PageFooter />
    </div>
  )
}

export default ApplicationStateDetailsPage
