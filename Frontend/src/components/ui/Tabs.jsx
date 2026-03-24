import React, { useState } from "react"
import { cn } from "../../utils"

export function Tabs({ tabs, defaultTab, onChange, className }) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const handleTabClick = (tabId) => {
    setActiveTab(tabId)
    if (onChange) onChange(tabId)
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex w-full overflow-x-auto border-b border-zinc-100 hide-scrollbar dark:border-zinc-800/50">
        <div className="flex space-x-8 px-4 sm:px-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "relative whitespace-nowrap py-5 text-sm font-bold tracking-tight transition-all focus:outline-none",
                  isActive
                    ? "text-brand-600 dark:text-brand-400"
                    : "text-zinc-500 hover:text-zinc-950 dark:text-zinc-500 dark:hover:text-zinc-200"
                )}
              >
                <span className="font-display uppercase tracking-widest text-[11px]">{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 h-0.5 w-full bg-brand-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                )}
              </button>
            )
          })}
        </div>
      </div>
      <div className="pt-6">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  )
}
