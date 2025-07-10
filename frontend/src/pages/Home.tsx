import logo from '../assets/wide_apple_logo.png'
import bg from '../assets/wideapple_bg.png'

const Home = () => (
    <div
        className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center relative"
        style={{ backgroundImage: `url(${bg})` }}
    >
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="relative z-10 flex flex-col items-center">
            <div className="w-48 h-48 mb-8 flex items-center justify-center rounded-full bg-white border-4 border-yellow-300 shadow-2xl overflow-hidden">
                <img src={logo} alt="WideApple Logo" className="w-40 h-40 object-contain" />
            </div>
            <h1 className="text-5xl font-extrabold mb-3 text-white drop-shadow-lg text-center">Welcome to WideApple!</h1>
            <p className="mb-8 text-lg text-white/90 text-center tracking-wide">Interdimensional Fruit Exchange Platform</p>
            <div className="flex gap-6">
                <a href="/login" className="px-8 py-3 rounded-full font-bold text-lg shadow-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:scale-105 transition-transform">Login</a>
                <a href="/register" className="px-8 py-3 rounded-full font-bold text-lg shadow-lg bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white hover:scale-105 transition-transform">Register</a>
            </div>
        </div>
    </div>
)

export default Home
