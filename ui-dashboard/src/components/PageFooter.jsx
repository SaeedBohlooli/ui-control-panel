function PageFooter() {
  return (
    <footer style={{ 
      marginTop: 60, 
      paddingTop: 20, 
      borderTop: '1px solid #e5e7eb',
      textAlign: 'center',
      color: '#9ca3af',
      fontSize: 14
    }}>
      <p style={{ margin: 0 }}>Multi-Account Algo Trading Dashboard</p>
      <p style={{ margin: '8px 0 0 0' }}>© {new Date().getFullYear()}</p>
    </footer>
  )
}

export default PageFooter
