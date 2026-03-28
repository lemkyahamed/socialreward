import React from "react"
import { Link, useLocation } from "react-router-dom"
import { Rocket, LogOut } from "lucide-react"
import { cn } from "../../utils"
import { Button } from "../ui/Button"

import { useAuth } from "../../contexts/AuthContext"

export function Sidebar({ navItems }) {
  const location = useLocation()
  const { logout } = useAuth()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800/50 dark:bg-zinc-950 md:flex">
      {/* Brand area */}
      <div className="flex h-16 items-center border-b border-zinc-100 px-6 dark:border-zinc-800/50">
        <Link to="/" className="flex items-center gap-2.5 transition-all hover:opacity-90 active:scale-95">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 shadow-md shadow-brand-500/20">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            SocialRewards
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="flex flex-col gap-1.5 text-sm font-semibold">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                )}
              >
                <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-brand-600 dark:text-brand-400" : "text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50")} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer Area / Logout */}
      <div className="border-t border-zinc-100 p-4 dark:border-zinc-800/50">
        <Button 
          onClick={logout} 
          variant="ghost" 
          className="w-full justify-start text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          <LogOut className="mr-3 h-5 w-5 opacity-70" />
          Sign Out
        </Button>
      </div>
    </aside>
  )
}
