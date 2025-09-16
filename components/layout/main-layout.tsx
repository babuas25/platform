"use client"

import { useState, useEffect } from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { cn } from "@/lib/utils"

interface MainLayoutProps {
  children: React.ReactNode
  contentClassName?: string
}

export function MainLayout({ children, contentClassName }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by controlling when interactive elements render
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header renders immediately to prevent layout shift */}
      <Header onSidebarToggle={toggleSidebar} isSidebarOpen={sidebarOpen} sidebarCollapsed={sidebarCollapsed} />
      
      <div className="pt-14"> 
        {/* Sidebar renders immediately but with fallback state until mounted */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={closeSidebar} 
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />
        
        {/* Main content - consistent margin calculation */}
        <main className={cn(
          "min-h-[calc(100vh-3.5rem)] overflow-x-auto transition-[margin] duration-200 ease-in-out",
          // Use consistent sidebar state for both server and client initial render
          mounted && !sidebarCollapsed ? "lg:ml-[256px]" : "lg:ml-[81px]",
          "ml-0" // No margin on mobile
        )}>
          <div className={cn("p-6 w-full", contentClassName)}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}