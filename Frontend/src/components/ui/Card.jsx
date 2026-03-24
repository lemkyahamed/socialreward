import React from "react"
import { cn } from "../../utils"

export const Card = React.forwardRef(({ className, hoverable = false, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-zinc-200 bg-white text-zinc-950 shadow-soft transition-all duration-300 dark:border-zinc-800/50 dark:bg-white/[0.02] dark:text-zinc-50",
      hoverable && "hover:border-brand-500/30 hover:shadow-premium hover:-translate-y-1 cursor-pointer",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
Card.displayName = "Card"

export const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

export const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("font-display text-xl font-bold leading-tight tracking-tight", className)} {...props} />
))
CardTitle.displayName = "CardTitle"

export const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-zinc-500 dark:text-zinc-400/80 leading-relaxed", className)} {...props} />
))
CardDescription.displayName = "CardDescription"

export const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

export const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0 border-t border-zinc-100 dark:border-zinc-800/50 mt-4", className)} {...props} />
))
CardFooter.displayName = "CardFooter"
