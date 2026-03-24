import React from "react"
import { cn } from "../../utils"

export const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2 text-sm transition-all placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 focus-visible:border-brand-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800/50 dark:bg-zinc-900/50 dark:placeholder:text-zinc-500 dark:focus-visible:ring-brand-500/20 font-medium",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-bold tracking-wide text-zinc-700 dark:text-zinc-400 mb-2 block",
      className
    )}
    {...props}
  />
))
Label.displayName = "Label"
