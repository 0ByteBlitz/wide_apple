import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import AuthFormContainer from './AuthFormContainer'

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
        <AuthFormContainer
            title="Login"
            footer={<span>Don&apos;t have an account? <a href="/register" className="font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent hover:underline">Register</a></span>}
        >
            <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
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
            </form>
        </AuthFormContainer>
    )
}

export default LoginForm
