import React from "react"
import { Menu, Bell } from "lucide-react"

export function Topbar({ userRole, userName, onMobileMenuToggle }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-100 bg-white/80 px-4 backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-950/80 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={onMobileMenuToggle}
          className="rounded-xl p-2 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 md:hidden dark:hover:bg-zinc-900 dark:hover:text-zinc-50 transition-colors"
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications placeholder */}
        <button className="relative rounded-xl p-2 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white dark:ring-zinc-950" />
        </button>

        {/* User Profile placeholder */}
        <div className="flex items-center gap-3 border-l border-zinc-100 pl-4 dark:border-zinc-800/50">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-sm font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 shadow-sm transition-transform hover:scale-105">
            {userName ? userName.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="hidden flex-col md:flex">
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-none">{userName || "User Name"}</span>
            <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">{userRole || "User"}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
