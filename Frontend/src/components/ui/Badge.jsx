import React from "react"
import { cn } from "../../utils"

const badgeVariants = {
  default: "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100",
  primary: "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 border border-brand-200 dark:border-brand-800",
  success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800",
  warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
  danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800",
  outline: "text-zinc-950 border border-zinc-200 dark:text-zinc-50 dark:border-zinc-800",
}

export function Badge({
  className,
  variant = "default",
  ...props
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  )
}
