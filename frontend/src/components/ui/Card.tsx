'use client';

import * as React from "react"
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils"

// Shadcn Card Components
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Custom Story Cards (Legacy Components for compatibility)
interface CustomCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function StoryCard({ children, className = '', onClick }: CustomCardProps) {
  const cardContent = (
    <div className={cn(
      "bg-white/70 backdrop-blur-sm rounded-[2rem] p-6 shadow-sm border border-white relative overflow-hidden",
      className
    )}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/30 rounded-full opacity-20 -translate-y-10 translate-x-10" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-accent/20 to-primary/30 rounded-full opacity-20 translate-y-8 -translate-x-8" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );

  if (onClick) {
    return (
      <motion.div
        whileHover={{
          scale: 1.01,
          y: -2
        }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        onClick={onClick}
        className="cursor-pointer"
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
}

export function ConfigCard({ children, className = '', onClick }: CustomCardProps) {
  const cardContent = (
    <div className={cn(
      "bg-white/70 backdrop-blur-sm rounded-[2rem] p-6 shadow-sm border border-white relative overflow-hidden",
      className
    )}>
      {/* Sparkle decorations */}
      <div className="absolute top-4 right-4">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
      </div>
      <div className="absolute top-8 right-8">
        <div className="w-1 h-1 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>
      <div className="absolute bottom-6 left-6">
        <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );

  if (onClick) {
    return (
      <motion.div
        whileHover={{
          scale: 1.01,
          y: -2
        }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        onClick={onClick}
        className="cursor-pointer"
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
