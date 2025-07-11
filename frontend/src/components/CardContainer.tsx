import React from 'react';

interface CardContainerProps {
    heading: string;
    children: React.ReactNode;
    button?: React.ReactNode;
    className?: string;
}

const CardContainer: React.FC<CardContainerProps> = ({ heading, children, button, className }) => (
    <div className={`flex flex-col items-center justify-center min-h-[60vh] ${className || ''}`}>
        <div className="w-full max-w-lg p-8 rounded-3xl shadow-2xl bg-white/90 backdrop-blur-md flex flex-col items-center">
            <h2 className="text-3xl font-extrabold mb-6 text-gray-900 text-center">{heading}</h2>
            {children}
            {button && <div className="mt-4">{button}</div>}
        </div>
    </div>
);

export default CardContainer; 