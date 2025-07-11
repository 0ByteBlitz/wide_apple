import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import logo from '../assets/wide_apple_logo.png'
import { fetchWithAuth } from '../utils/tokenUtils'

const USER_ICON = (
    <span className="inline-block w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 via-yellow-300 to-green-400 flex items-center justify-center text-white font-bold text-xl shadow">👽</span>
)

const NavBar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [username, setUsername] = useState('')
    const [menuOpen, setMenuOpen] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem('access_token'))
        setMenuOpen(false)
        if (localStorage.getItem('access_token')) {
            fetchWithAuth('http://localhost:8000/auth/me')
                .then(res => res.ok ? res.json() : null)
                .then(data => setUsername(data?.username || ''))
                .catch(() => setUsername(''))
        } else {
            setUsername('')
        }
    }, [location])

    const handleLogout = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setIsLoggedIn(false)
        setUsername('')
        setMenuOpen(false)
        navigate('/login')
    }

    return (
        <nav className="w-full bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3">
                    <img src={logo} alt="WideApple Logo" className="w-10 h-10 rounded-full bg-white border-2 border-yellow-300 shadow" />
                    <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-yellow-400 to-green-400 drop-shadow-lg tracking-wide">WideApple</span>
                </Link>
                {/* Desktop menu */}
                <div className="hidden md:flex gap-6 text-lg font-semibold items-center">
                    {!isLoggedIn && <Link to="/" className="hover:text-pink-500 transition-colors">Home</Link>}
                    {isLoggedIn ? (
                        <>
                            <Link to="/dashboard" className="hover:text-yellow-500 transition-colors">Dashboard</Link>
                            <Link to="/trade" className="hover:text-green-500 transition-colors">Trade</Link>
                            <div className="flex items-center gap-2">
                                {USER_ICON}
                                <span className="font-bold text-gray-700">{username}</span>
                            </div>
                            <button onClick={handleLogout} className="hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer font-semibold">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-blue-500 transition-colors">Login</Link>
                            <Link to="/register" className="hover:text-orange-500 transition-colors">Register</Link>
                        </>
                    )}
                </div>
                {/* Burger menu for mobile */}
                <div className="md:hidden flex items-center">
                    <button onClick={() => setMenuOpen(m => !m)} className="focus:outline-none">
                        <span className="block w-8 h-1 bg-gradient-to-r from-pink-500 via-yellow-400 to-green-400 mb-1 rounded"></span>
                        <span className="block w-8 h-1 bg-gradient-to-r from-pink-500 via-yellow-400 to-green-400 mb-1 rounded"></span>
                        <span className="block w-8 h-1 bg-gradient-to-r from-pink-500 via-yellow-400 to-green-400 rounded"></span>
                    </button>
                </div>
            </div>
            {/* Mobile menu dropdown */}
            {menuOpen && (
                <div className="md:hidden bg-white shadow-lg px-4 py-4 flex flex-col gap-4 text-lg font-semibold">
                    {!isLoggedIn && <Link to="/" className="hover:text-pink-500 transition-colors" onClick={() => setMenuOpen(false)}>Home</Link>}
                    {isLoggedIn ? (
                        <>
                            <Link to="/dashboard" className="hover:text-yellow-500 transition-colors" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                            <Link to="/trade" className="hover:text-green-500 transition-colors" onClick={() => setMenuOpen(false)}>Trade</Link>
                            <div className="flex items-center gap-2">
                                {USER_ICON}
                                <span className="font-bold text-gray-700">{username}</span>
                            </div>
                            <button onClick={handleLogout} className="hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer font-semibold text-left">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-blue-500 transition-colors" onClick={() => setMenuOpen(false)}>Login</Link>
                            <Link to="/register" className="hover:text-orange-500 transition-colors" onClick={() => setMenuOpen(false)}>Register</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    )
}

export default NavBar 