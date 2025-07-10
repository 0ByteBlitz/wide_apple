import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import loginBg from '../assets/wideapple_login_bg.png'

const LoginForm = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        try {
            const params = new URLSearchParams()
            params.append('username', username)
            params.append('password', password)
            const res = await axios.post('/auth/token', params, {
                baseURL: 'http://localhost:8000',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            })
            localStorage.setItem('access_token', res.data.access_token)
            localStorage.setItem('refresh_token', res.data.refresh_token)
            navigate('/dashboard')
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Login failed')
        }
    }

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row relative">
            {/* Left: Company name and form */}
            <div className="md:w-2/5 w-full flex flex-col items-center justify-center bg-white/90 backdrop-blur-md p-8 z-10">
                <form onSubmit={handleSubmit} className="w-full max-w-md p-8 rounded-3xl shadow-2xl flex flex-col items-center">
                    <h2 className="text-3xl font-extrabold mb-6 text-gray-900 text-center bg-gradient-to-r from-pink-500 via-yellow-400 to-green-400 drop-shadow-lg tracking-wide">Login</h2>
                    {error && <div className="text-red-500 mb-4 font-semibold">{error}</div>}
                    <input
                        className="w-full mb-4 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                    />
                    <input
                        className="w-full mb-6 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <button className="w-full py-3 rounded-full font-bold text-lg shadow-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:scale-105 transition-transform mb-4" type="submit">Login</button>
                    <div className="mt-2 text-base text-center">
                        Don&apos;t have an account?{' '}
                        <a href="/register" className="font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent hover:underline">Register</a>
                    </div>
                </form>
            </div>
            {/* Right: Background image */}
            <div className="md:w-3/5 w-full min-h-[40vh] md:min-h-screen bg-cover bg-center z-0" style={{ backgroundImage: `url(${loginBg})` }} />
        </div>
    )
}

export default LoginForm
