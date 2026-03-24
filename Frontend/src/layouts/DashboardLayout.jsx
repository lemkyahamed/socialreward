import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "../components/shared/Sidebar"
import { Topbar } from "../components/shared/Topbar"

export function DashboardLayout({ navItems, userRole, userName }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <Sidebar 
        navItems={navItems} 
        baseRoute={`/${userRole}`} 
      />
      
      {/* Main content area shifts to the right on desktop */}
      <div className="flex flex-1 flex-col md:pl-64 transition-all duration-300">
        <Topbar 
          userRole={userRole} 
          userName={userName} 
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div 
            className="fixed inset-0 z-40 bg-zinc-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 translate-x-0 transform bg-white transition-transform dark:bg-zinc-950">
            <Sidebar navItems={navItems} baseRoute={`/${userRole}`} />
          </div>
        </div>
      )}
    </div>
  )
}
