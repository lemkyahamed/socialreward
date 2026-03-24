import React from "react"
import { cn } from "../../utils"

export function EmptyState({
  title = "No results found",
  description = "Try adjusting your filters or creating a new item.",
  action,
  className
}) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/40",
        className
      )}
    >
      <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white shadow-soft dark:bg-zinc-900 mb-8 border border-zinc-100 dark:border-zinc-800/50">
        <Icon className="h-10 w-10 text-brand-600 dark:text-brand-400" />
      </div>
      <h3 className="mb-3 font-display text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">{title}</h3>
      <p className="mb-8 max-w-sm text-base text-zinc-500 dark:text-zinc-400 font-medium">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  )
}
