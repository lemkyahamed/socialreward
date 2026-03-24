import React from "react"
import { Link } from "react-router-dom"
import { Button } from "../../components/ui/Button"
import { Card } from "../../components/ui/Card"
import { PageHeader } from "../../components/shared/PageHeader"

export function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-6xl mb-6">
          Empowering the <span className="text-brand-600">Creator</span> Economy
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-zinc-500 font-medium leading-relaxed dark:text-zinc-400">
          At Social Reward, we believe that every creator deserves to be compensated for their authentic voice, no matter their subscriber count.
        </p>
      </div>

      <div className="mt-24 grid gap-12 sm:grid-cols-2">
        <Card className="p-8 shadow-soft border-zinc-100 dark:border-zinc-800/50">
          <h2 className="font-display text-2xl font-bold text-zinc-950 dark:text-zinc-50 mb-4">Our Mission</h2>
          <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">
            Social Reward bridges the gap between innovative brands and passionate creators. We're dedicated to democratizing brand deals and ensuring transparency in every partnership.
          </p>
        </Card>
        <Card className="p-8 shadow-soft border-zinc-100 dark:border-zinc-800/50">
          <h2 className="font-display text-2xl font-bold text-zinc-950 dark:text-zinc-50 mb-4">Our Impact</h2>
          <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">
            Founded in 2026, we have already facilitated over 10,000 successful campaigns, paying out millions to creators worldwide and helping brands reach millions of authentic customers.
          </p>
        </Card>
      </div>

      <div className="mt-24 rounded-[3rem] bg-zinc-900 p-12 lg:p-20 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-600/20 to-transparent opacity-50"></div>
        <div className="relative z-10">
          <h2 className="font-display text-3xl font-bold text-white mb-8">Ready to join the revolution?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="px-10 h-14 rounded-2xl text-lg">I'm a Creator</Button>
            </Link>
            <Link to="/register?role=brand">
              <Button size="lg" variant="outline" className="px-10 h-14 rounded-2xl text-lg border-white/20 text-white hover:bg-white/10">I'm a Brand</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
