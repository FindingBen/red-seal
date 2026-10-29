import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Class from './pages/Class.jsx'
import Dashboard from './pages/Dashboard.jsx'
import LoginPage from './pages/LoginPage.jsx'
import LessonsTimetable from './pages/LessonsTimetable.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  return  (
    <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/class/:classId"
        element={
          <ProtectedRoute>
            <Class />
          </ProtectedRoute>
        }
      />
      <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons"
            element={
              <ProtectedRoute>
                <LessonsTimetable />
              </ProtectedRoute>
            }
          />
    </Routes>
    </BrowserRouter>
  )
}

export default App
