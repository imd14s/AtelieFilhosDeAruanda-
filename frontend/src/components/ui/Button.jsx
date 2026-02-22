import React from 'react';
import Spinner from './Spinner';

const Button = ({
    children,
    type = 'button',
    variant = 'primary',
    isLoading = false,
    disabled = false,
    onClick,
    className = '',
    ...props
}) => {
    const baseStyles = "relative flex items-center justify-center gap-2 font-lato text-xs uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-[#0f2A44] text-white hover:bg-[#C9A24D]",
        outline: "bg-transparent border border-[#0f2A44] text-[#0f2A44] hover:bg-[#0f2A44] hover:text-white",
        gold: "bg-[#C9A24D] text-white hover:bg-[#0f2A44]",
    };

    const currentVariant = variants[variant] || variants.primary;

    return (
        <button
            type={type}
            disabled={disabled || isLoading}
            onClick={onClick}
            className={`${baseStyles} ${currentVariant} ${className}`}
            {...props}
        >
            {isLoading && <Spinner size={16} />}
            <span className={`${isLoading ? 'opacity-0' : 'opacity-100'} flex items-center justify-center gap-2`}>
                {children}
            </span>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Spinner size={16} />
                </div>
            )}
        </button>
    );
};

export default Button;
