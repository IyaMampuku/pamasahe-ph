import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-3xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
          {
            'bg-[#1a00b2] text-white hover:bg-[#1a00b2]/90 shadow-md': variant === 'primary',
            'bg-[#f2ca4b] text-[#1a00b2] hover:bg-[#f2ca4b]/90 shadow-md': variant === 'secondary',
            'border-2 border-[#1a00b2] text-[#1a00b2] bg-transparent hover:bg-gray-100': variant === 'outline',
            'hover:bg-gray-100 text-gray-700': variant === 'ghost',
            'h-9 px-4 text-sm': size === 'sm',
            'h-12 px-8 text-base': size === 'md',
            'h-14 px-10 text-lg': size === 'lg',
            'w-full': fullWidth,
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
