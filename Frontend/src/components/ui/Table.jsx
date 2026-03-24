import React from "react"
import { cn } from "../../utils"

export const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800/50 dark:bg-zinc-900/50">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

export const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b dark:border-zinc-800/50", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

export const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

export const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-zinc-100 transition-colors hover:bg-zinc-50/50 data-[state=selected]:bg-zinc-100 dark:border-zinc-800/50 dark:hover:bg-zinc-800/30 dark:data-[state=selected]:bg-zinc-800",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

export const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-50/50 dark:bg-zinc-950/30 dark:text-zinc-400 [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

export const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle text-zinc-700 dark:text-zinc-300 [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"
