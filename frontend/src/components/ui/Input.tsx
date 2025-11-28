'use client';

import * as React from "react"
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils"

// Shadcn Input Component
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

// Legacy Custom Input Components
interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function MagicalInput({
  label,
  error,
  icon,
  className = '',
  ...props
}: CustomInputProps) {
  const baseClasses = cn(
    "w-full h-16 px-6 text-xl rounded-2xl border border-slate-100",
    "transition-all duration-200",
    "focus:outline-none focus:ring-4 focus:border-primary/30 focus:ring-primary/5",
    "bg-white shadow-sm",
    "placeholder:text-slate-300",
    error && "border-destructive focus:border-destructive focus:ring-destructive/20",
    icon && "pl-14",
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-foreground/80">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          className={baseClasses}
          {...props}
        />
      </div>
      {error && (
        <motion.p
          className="text-sm text-destructive"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

// Legacy Custom TextArea Component
interface CustomTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function MagicalTextArea({
  label,
  error,
  className = '',
  ...props
}: CustomTextAreaProps) {
  const baseClasses = cn(
    "w-full min-h-[250px] p-6 text-xl leading-relaxed rounded-3xl border border-slate-100",
    "transition-all duration-200",
    "focus:outline-none focus:ring-4 focus:border-primary/30 focus:ring-primary/5",
    "bg-white shadow-sm",
    "resize-none",
    "placeholder:text-slate-300",
    error && "border-destructive focus:border-destructive focus:ring-destructive/20",
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-foreground/80">
          {label}
        </label>
      )}
      <textarea
        className={baseClasses}
        {...props}
      />
      {error && (
        <motion.p
          className="text-sm text-destructive"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

export { Input }
