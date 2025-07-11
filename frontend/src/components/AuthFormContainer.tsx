import React from 'react';
import loginBg from '../assets/wideapple_login_bg.png';

interface AuthFormContainerProps {
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

const AuthFormContainer: React.FC<AuthFormContainerProps> = ({ title, children, footer }) => (
    <div className="min-h-screen w-full flex flex-col md:flex-row relative">
        {/* Left: Form */}
        <div className="md:w-2/5 w-full flex flex-col items-center justify-center bg-white/90 backdrop-blur-md p-8 z-10">
            <form className="w-full max-w-md p-8 rounded-3xl shadow-2xl flex flex-col items-center">
                <h2 className="text-3xl font-extrabold mb-6 text-gray-900 text-center bg-gradient-to-r from-pink-500 via-yellow-400 to-green-400 drop-shadow-lg tracking-wide">{title}</h2>
                {children}
                {footer && <div className="mt-2 text-base text-center">{footer}</div>}
            </form>
        </div>
        {/* Right: Background image */}
        <div className="md:w-3/5 w-full min-h-[40vh] md:min-h-screen bg-cover bg-center z-0" style={{ backgroundImage: `url(${loginBg})` }} />
    </div>
);

export default AuthFormContainer; 