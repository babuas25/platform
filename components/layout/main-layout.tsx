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

  // Prevent hydration mismatch by only rendering interactive elements after mount
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
  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed top-0 left-0 right-0 h-14 bg-background border-b z-50"></div>
        <div className="pt-14">
          <main className="min-h-[calc(100vh-3.5rem)] lg:ml-[81px] ml-0">
            <div className="p-6 w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onSidebarToggle={toggleSidebar} isSidebarOpen={sidebarOpen} sidebarCollapsed={sidebarCollapsed} />
      
      <div className="pt-14"> 
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={closeSidebar} 
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />
        
        {/* Main content - adjust margin based on sidebar state */}
        <main className={cn(
          "min-h-[calc(100vh-3.5rem)] overflow-x-auto transition-[margin] duration-200 ease-in-out",
          mounted ? (sidebarCollapsed ? "lg:ml-[81px]" : "lg:ml-[256px]") : "lg:ml-[81px]", // Default to collapsed on server
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