import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import NavBar from './components/NavBar'

function PrivateHome() {
  const isLoggedIn = !!localStorage.getItem('access_token')
  return isLoggedIn ? <Navigate to="/dashboard" replace /> : <Home />
}

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<PrivateHome />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default App
