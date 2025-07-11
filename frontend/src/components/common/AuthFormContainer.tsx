import React from 'react';

interface AuthFormContainerProps {
    title: string;
    footer?: React.ReactNode;
    children: React.ReactNode;
    bgImage?: string;
}

const AuthFormContainer: React.FC<AuthFormContainerProps> = ({ title, footer, children, bgImage }) => (
    <div className="min-h-screen w-full flex flex-col md:flex-row relative">
        {/* Left: Form */}
        <div className="md:w-2/5 w-full flex flex-col items-center justify-center p-8 z-10">
            <div className="w-full max-w-md rounded-3xl shadow-2xl bg-white/90 backdrop-blur-md flex flex-col items-center p-8">
                <h2 className="text-3xl font-bold mb-6 text-purple-700">{title}</h2>
                {children}
                <div className="mt-6 text-center">{footer}</div>
            </div>
        </div>
        {/* Right: Background image */}
        {bgImage && (
            <div
                className="md:w-3/5 w-full min-h-[40vh] md:min-h-screen bg-cover bg-center z-0"
                style={{ backgroundImage: `url(${bgImage})` }}
            />
        )}
    </div>
);

export default AuthFormContainer; 