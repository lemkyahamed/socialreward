import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Rocket } from "lucide-react"
import { Button } from "../../components/ui/Button"
import { Input, Label } from "../../components/ui/Input"
import { cn } from "../../utils"
import { useAuth } from "../../contexts/AuthContext"

export function Auth({ mode = "login" }) {
  const [role, setRole] = useState("creator")
  const navigate = useNavigate()

  const { login: apiLogin, register: apiRegister } = useAuth()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.target)
    const email = formData.get("email")
    const password = formData.get("password")
    const profileName = formData.get("profileName")

    try {
      let userData
      if (mode === "login") {
        userData = await apiLogin(email, password)
      } else {
        const profilePayload = role === 'creator' 
          ? { displayName: profileName } 
          : { companyName: profileName };
        userData = await apiRegister({ email, password, role, profile: profilePayload })
      }

      // Check URL parameters for redirect
      const urlParams = new URLSearchParams(window.location.search)
      const redirect = urlParams.get("redirect")

      if (redirect) {
        navigate(redirect)
      } else {
        navigate(`/${userData.role}`) // Route based on returned role
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-6 lg:p-12 overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-brand-600/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-brand-600/5 blur-[120px] pointer-events-none"></div>

      <div className="relative w-full max-w-lg rounded-[2.5rem] border border-zinc-200 bg-white p-10 shadow-premium dark:border-zinc-800/50 dark:bg-zinc-900/80 backdrop-blur-xl sm:p-12">
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/20">
            <Rocket className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl">
            {mode === "login" ? "Welcome back" : "Create an account"}
          </h1>
          <p className="mt-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {mode === "login"
              ? "Sign in to manage your campaigns and earnings."
              : "Join Social Reward and start growing your brand or career."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {mode === "register" && (
            <div className="space-y-4">
              <Label className="uppercase text-[10px] tracking-widest text-zinc-500">Choose your path</Label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: "creator", label: "Creator", desc: "I want to earn" },
                  { id: "brand", label: "Brand", desc: "I want to grow" }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id)}
                    className={cn(
                      "group flex flex-col items-center justify-center rounded-2xl border-2 p-5 transition-all duration-300",
                      role === item.id
                        ? "border-brand-500 bg-brand-50/50 shadow-sm dark:border-brand-500 dark:bg-brand-500/10 scale-[1.02]"
                        : "border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                    )}
                  >
                    <span className={cn(
                      "font-display text-lg font-bold transition-colors",
                      role === item.id ? "text-brand-600 dark:text-brand-400" : "text-zinc-950 dark:text-zinc-50"
                    )}>
                      {item.label}
                    </span>
                    <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-500">
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 p-4 mb-4 text-sm text-red-500 border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="profileName">{role === 'creator' ? 'Display Name' : 'Company Name'}</Label>
                <Input id="profileName" name="profileName" type="text" placeholder={role === 'creator' ? 'Your Name' : 'Company Ltd'} required className="h-12 rounded-xl" />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required className="h-12 rounded-xl" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === "login" && (
                  <a href="#" className="text-xs font-bold text-brand-600 hover:text-brand-500 transition-colors">
                    Forgot password?
                  </a>
                )}
              </div>
              <Input id="password" name="password" type="password" placeholder="••••••••" required className="h-12 rounded-xl" />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-14 rounded-xl text-lg font-bold shadow-lg shadow-brand-600/20 active:scale-[0.98] transition-all">
            {loading ? "Please wait..." : (mode === "login" ? "Continue" : "Get Started")}
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-zinc-100 dark:border-zinc-800/50 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {mode === "login" ? (
            <>
              New to Social Reward?{" "}
              <Link to="/register" className="font-bold text-brand-600 hover:text-brand-500 transition-colors">
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-brand-600 hover:text-brand-500 transition-colors">
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
