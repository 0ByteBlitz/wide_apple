import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import AuthFormContainer from './common/AuthFormContainer'
import loginBg from '../assets/wideapple_login_bg.png'
import { BACKEND_URL } from '../constants';

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
                baseURL: BACKEND_URL,
            })
            setSuccess('Registration successful! Redirecting to login...')
            setTimeout(() => navigate('/login'), 1500)
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Registration failed')
        }
    }

    return (
        <AuthFormContainer
            title="Register"
            footer={<span>Already have an account? <Link to="/login" className="font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent hover:underline">Login</Link></span>}
            bgImage={loginBg}
        >
            <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
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
                                    <span className="inline-block w-4 h-4 rounded-full bg-green-400 flex items-center justify-center text-white text-xs">&#10003;</span>
                                ) : (
                                    <span className="inline-block w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs">&#10007;</span>
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
            </form>
        </AuthFormContainer>
    )
}

export default RegisterForm 