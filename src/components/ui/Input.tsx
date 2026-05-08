import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, error, ...props }, ref) => {
    return (
      <div className="w-full relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "flex h-14 w-full rounded-2xl border bg-white px-4 py-2 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a00b2] disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-12",
            error ? "border-red-500 focus-visible:ring-red-500" : "border-gray-200",
            className
          )}
          {...props}
        />
        {error && <span className="text-red-500 text-sm mt-1 ml-2 block">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
