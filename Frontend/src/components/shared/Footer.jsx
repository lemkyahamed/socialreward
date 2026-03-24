import React from "react"
import { Rocket } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-12 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              SocialRewards
            </span>
          </div>
          <nav className="flex gap-6 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">About</a>
            <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">Terms</a>
            <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">Contact</a>
          </nav>
        </div>
        <div className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          &copy; {new Date().getFullYear()} SocialRewards Inc. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
