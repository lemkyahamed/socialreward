import React from "react"

export function PageHeader({ title, description, action }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-8 dark:border-zinc-800/50">
      <div className="space-y-1.5">
        <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex shrink-0 items-center gap-3">
          {action}
        </div>
      )}
    </div>
  )
}
