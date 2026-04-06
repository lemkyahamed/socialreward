import React from "react"
import { Shield, ShieldAlert, ShieldCheck, Star } from "lucide-react"

export function TrustBadge({ label = "New", score = 0, showScore = false, className = "" }) {
  // Map label to aesthetics natively checking our 4-tier bounds cleanly
  const configs = {
    New: {
      color: "text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700",
      icon: Shield
    },
    Rising: {
      color: "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/20 border-brand-200 dark:border-brand-500/30",
      icon: Star
    },
    Trusted: {
      color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/30",
      icon: ShieldCheck
    },
    Verified: {
      color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/20 border-green-200 dark:border-green-500/30",
      icon: ShieldCheck
    }
  }

  // Gracefully handle raw drop states if algorithmic hooks suspend
  if (score < 20) {
    configs.New = {
      color: "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30",
      icon: ShieldAlert
    }
  }

  const active = configs[label] || configs.New;
  const Icon = active.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${active.color} ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      <span className="text-[10px] uppercase font-black tracking-widest">{score < 20 ? "At Risk" : label}</span>
      {showScore && (
        <>
          <div className="h-3 w-px bg-current opacity-30 mx-0.5"></div>
          <span className="text-xs font-bold leading-none">{score}</span>
        </>
      )}
    </div>
  )
}
