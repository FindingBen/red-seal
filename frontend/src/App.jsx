import { useState } from 'react'
import Dashboard from './pages/Dashboard.jsx'
import LoginPage from './pages/LoginPage.jsx'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  return isAuthenticated ? (
    <Dashboard onLogout={() => setIsAuthenticated(false)} />
  ) : (
    <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
  )
}

export default App
