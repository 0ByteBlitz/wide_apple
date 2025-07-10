import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import loginBg from '../assets/wideapple_login_bg.png'

const passwordChecks = [
    {
        label: 'At least 8 characters',
        test: (pw: string) => pw.length >= 8,
    },
    {
        label: 'One uppercase letter',
        test: (pw: string) => /[A-Z]/.test(pw),
    },
    {
        label: 'One lowercase letter',
        test: (pw: string) => /[a-z]/.test(pw),
    },
    {
        label: 'One digit',
        test: (pw: string) => /\d/.test(pw),
    },
    {
        label: 'One special character',
        test: (pw: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw),
    },
]

const passwordRequirements = {
    regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
    message:
        'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one digit, and one special character.'
}

const RegisterForm = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        if (!passwordRequirements.regex.test(password)) {
            setError(passwordRequirements.message)
            return
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }
        try {
            await axios.post('/auth/register', { username, password }, {
                baseURL: 'http://localhost:8000',
            })
            setSuccess('Registration successful! Redirecting to login...')
            setTimeout(() => navigate('/login'), 1500)
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Registration failed')
        }
    }

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row relative">
            <div className="md:w-2/5 w-full flex flex-col items-center justify-center bg-white/90 backdrop-blur-md p-8 z-10">
                <form onSubmit={handleSubmit} className="w-full max-w-md p-8 rounded-3xl shadow-2xl flex flex-col items-center">
                    <h2 className="text-3xl font-extrabold mb-6 text-gray-900 text-center bg-gradient-to-r from-pink-500 via-yellow-400 to-green-400 drop-shadow-lg tracking-wide">Register</h2>
                    {error && <div className="text-red-500 mb-4 font-semibold">{error}</div>}
                    {success && <div className="text-green-600 mb-4 font-semibold">{success}</div>}
                    <input
                        className="w-full mb-4 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                    />
                    <input
                        className="w-full mb-2 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    {/* Live password checklist */}
                    <ul className="w-full mb-4 text-sm">
                        {passwordChecks.map((check, idx) => {
                            const passed = check.test(password)
                            return (
                                <li key={idx} className={`flex items-center gap-2 ${passed ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                                    {passed ? (
                                        <span className="inline-block w-4 h-4 rounded-full bg-green-400 flex items-center justify-center text-white text-xs">✓</span>
                                    ) : (
                                        <span className="inline-block w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs">✗</span>
                                    )}
                                    {check.label}
                                </li>
                            )
                        })}
                    </ul>
                    <input
                        className="w-full mb-6 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button className="w-full py-3 rounded-full font-bold text-lg shadow-lg bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white hover:scale-105 transition-transform mb-4" type="submit">Register</button>
                    <div className="mt-2 text-base text-center">
                        Already have an account?{' '}
                        <a href="/login" className="font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent hover:underline">Login</a>
                    </div>
                </form>
            </div>
            {/* Right: Background image */}
            <div className="md:w-3/5 w-full min-h-[40vh] md:min-h-screen bg-cover bg-center z-0" style={{ backgroundImage: `url(${loginBg})` }} />
        </div>
    )
}

export default RegisterForm 