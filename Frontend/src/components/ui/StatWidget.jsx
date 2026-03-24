import React from "react"
import { Card, CardContent } from "./Card"
import { cn } from "../../utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export function StatWidget({
  title,
  value,
  trend, // e.g. "up", "down", "neutral"
  trendValue, // e.g. "12%", "+4", etc.
  icon: Icon,
  className,
}) {
  return (
    <Card className={cn("overflow-hidden border-zinc-100 dark:border-zinc-800/50", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
            {title}
          </div>
          {Icon && (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-900 text-brand-600 dark:text-brand-400 shadow-sm">
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <div className="font-display text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            {value}
          </div>
          {trendValue && (
            <div
              className={cn(
                "flex items-center space-x-1 text-xs font-bold px-2 py-0.5 rounded-lg",
                trend === "up" && "text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-500/10",
                trend === "down" && "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-500/10",
                trend === "neutral" && "text-zinc-600 bg-zinc-50 dark:text-zinc-400 dark:bg-zinc-800"
              )}
            >
              {trend === "up" && <TrendingUp className="h-3 w-3" />}
              {trend === "down" && <TrendingDown className="h-3 w-3" />}
              {trend === "neutral" && <Minus className="h-3 w-3" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
