import React from 'react';
import clsx from 'clsx';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'rect' | 'circle';
}

const Skeleton: React.FC<SkeletonProps> = ({ className, variant = 'rect' }) => {
    return (
        <div
            className={clsx(
                "animate-pulse bg-gray-200",
                variant === 'text' && "h-4 w-full rounded",
                variant === 'circle' && "rounded-full",
                variant === 'rect' && "rounded-lg",
                className
            )}
        />
    );
};

export default Skeleton;
