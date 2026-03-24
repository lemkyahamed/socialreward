import React from "react"
import { cn } from "../../utils"

const buttonVariants = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm border border-transparent hover:shadow-premium ring-offset-background",
  secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border border-transparent dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700 shadow-soft",
  outline: "bg-transparent text-zinc-700 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:hover:border-zinc-700",
  ghost: "bg-transparent text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-50",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm border border-transparent hover:shadow-md",
  subtle: "bg-brand-50 text-brand-700 hover:bg-brand-100 border border-transparent dark:bg-brand-950/30 dark:text-brand-400 dark:hover:bg-brand-950/50",
  link: "bg-transparent underline-offset-4 hover:underline text-brand-600 dark:text-brand-400 p-0 h-auto",
}

const buttonSizes = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-6 py-2.5",
  lg: "h-13 px-8 text-lg",
  icon: "h-10 w-10",
}

export const Button = React.forwardRef(({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97] cursor-pointer",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})
Button.displayName = "Button"
