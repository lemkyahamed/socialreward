import React, { useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "../../utils"

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm">
      <div 
        className="fixed inset-0 z-50" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      <div
        className={cn(
          "relative z-50 w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900",
          className
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors dark:hover:bg-zinc-800 dark:hover:text-zinc-50 focus:outline-none"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          {title && (
            <h2 className="text-lg font-semibold leading-none tracking-tight text-zinc-950 dark:text-zinc-50">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          )}
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}
