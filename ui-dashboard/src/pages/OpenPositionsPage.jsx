import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import PageFooter from '../components/PageFooter'
import { getWebSocketUrl, getReconnectConfig, getFullApiUrl } from '../config/appConfig'

function OpenPositionsPage() {
  const [wsData, setWsData] = useState(null)
  const [status, setStatus] = useState('disconnected')
  const [lastReceived, setLastReceived] = useState(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [retryTimeout, setRetryTimeout] = useState(null)
  const wsRef = useRef(null)
  const retryTimeoutRef = useRef(null)
  const [quantities, setQuantities] = useState({})
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

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
            console.log('Received application_state:', parsed)
            console.log('ib_positions:', parsed['ib_positions'])
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

  const positions = wsData?.data?.['ib_positions'] || wsData?.['ib_positions'] || []
  
  // Initialize quantities with default values from positions
  useEffect(() => {
    if (Array.isArray(positions) && positions.length > 0) {
      const defaultQties = {}
      positions.forEach((pos, idx) => {
        if (!quantities[idx]) {
          defaultQties[idx] = Math.abs(pos.abs_qty || pos.quantity || pos.position || 0)
        }
      })
      setQuantities((prev) => ({ ...prev, ...defaultQties }))
    }
  }, [positions])

  // Sort positions based on sortConfig
  const sortedPositions = [...positions].sort((a, b) => {
    if (!sortConfig.key) return 0
    
    const aVal = a[sortConfig.key]
    const bVal = b[sortConfig.key]
    
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
  })

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  return (
    <div className="state-page">
      <PageHeader 
        title="Open Positions"
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
      
      <div style={{ marginBottom: 16 }}>
        <button 
          onClick={() => {
            const confirmed = window.confirm(
              'Close ALL open positions?\n\nThis will send a close request for all positions. Click Yes to confirm or No to cancel.'
            )
            
            if (!confirmed) {
              return
            }
            
            const closeAllOrder = {
              request_type: 'close_all_positions',
              web_request_id: `close_all_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            }
            console.log('Sending close all order:', closeAllOrder)
            
            fetch(getFullApiUrl('sendRequest'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(closeAllOrder),
            })
              .then((res) => res.json())
              .then((data) => {
                console.log('Response:', data)
                alert('Close all positions request sent')
              })
              .catch((err) => {
                console.error('Error:', err)
                alert(`Error sending close all request: ${err.message}`)
              })
          }}
          style={{
            padding: '8px 16px',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Close All Open Positions
        </button>
      </div>

      {Array.isArray(positions) && positions.length > 0 ? (
        <div style={{ marginBottom: 20 }}>
          <h3>IB Positions</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16, background: '#fff', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ccc', background: '#f5f5f5' }}>
                {positions.length > 0 && Object.keys(positions[0]).map((key) => (
                  <th 
                    key={key} 
                    onClick={() => handleSort(key)}
                    style={{ 
                      padding: 10, 
                      textAlign: 'left',
                      cursor: 'pointer',
                      userSelect: 'none',
                      position: 'relative'
                    }}
                  >
                    {key}
                    {sortConfig.key === key && (
                      <span style={{ marginLeft: 6 }}>
                        {sortConfig.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </th>
                ))}
                <th style={{ padding: 10, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedPositions.map((pos, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  {Object.entries(pos).map(([key, value]) => (
                    <td key={key} style={{ padding: 10 }}>
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </td>
                  ))}
                  <td style={{ padding: 10, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                      <input
                        type="number"
                        placeholder="Qty"
                        value={quantities[idx] || ''}
                        onChange={(e) => setQuantities({ ...quantities, [idx]: e.target.value })}
                        style={{
                          width: 80,
                          padding: '6px 8px',
                          border: '1px solid #ccc',
                          borderRadius: 4,
                        }}
                      />
                      <button
                        onClick={() => {
                          const qty = quantities[idx] || pos.quantity || pos.position
                          if (!qty) {
                            alert('Please enter a quantity')
                            return
                          }
                          
                          const confirmed = window.confirm(
                            `Close ${pos.symbol || pos.contract} with quantity ${qty}?\n\nClick Yes to confirm or No to cancel.`
                          )
                          
                          if (!confirmed) {
                            return
                          }
                          
                          const closeOrder = {
                            request_type: 'close_position',
                            symbol: pos.symbol || pos.contract,
                            quantity: parseFloat(qty),
                            web_request_id: `close_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                          }
                          console.log('Sending close order:', closeOrder)
                          
                          fetch(getFullApiUrl('sendRequest'), {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(closeOrder),
                          })
                            .then((res) => res.json())
                            .then((data) => {
                              console.log('Response:', data)
                              alert(`Close order sent for ${closeOrder.symbol} (qty: ${closeOrder.quantity})`)
                            })
                            .catch((err) => {
                              console.error('Error:', err)
                              alert(`Error sending close order: ${err.message}`)
                            })
                        }}
                        style={{
                          padding: '6px 12px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer',
                        }}
                      >
                        Close
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ marginBottom: 20 }}>
          <p style={{ color: '#666' }}>No positions available</p>
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

export default OpenPositionsPage
