import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface VerifiedBadgeProps {
    className?: string;
    showLabel?: boolean;
}

/**
 * VerifiedBadge - Selo de Compra Verificada Premium
 * Design alinhado com a estética do Ateliê: Dourado, elegante e confiável.
 */
const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ className = '', showLabel = true }) => {
    return (
        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--dourado-suave)]/10 border border-[var(--dourado-suave)]/20 ${className}`}>
            <div className="relative flex items-center justify-center">
                <ShieldCheck size={12} className="text-[var(--dourado-suave)] relative z-10" />
                <div className="absolute inset-0 bg-[var(--dourado-suave)] blur-[4px] opacity-20 animate-pulse"></div>
            </div>
            {showLabel && (
                <span className="font-lato text-[9px] font-bold text-[var(--dourado-suave)] uppercase tracking-[0.1em]">
                    Compra Verificada
                </span>
            )}
        </div>
    );
};

export default VerifiedBadge;
