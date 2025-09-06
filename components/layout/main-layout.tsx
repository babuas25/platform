"use client"

import { useState } from "react"
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
      <Header onSidebarToggle={toggleSidebar} isSidebarOpen={sidebarOpen} sidebarCollapsed={sidebarCollapsed} />
      
      <div className="pt-14 flex"> {/* Use flex layout */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={closeSidebar} 
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />
        
        {/* Main content */}
        <main className="flex-1 min-h-[calc(100vh-3.5rem)] overflow-x-auto">
          <div className={cn("p-6 w-full", contentClassName)}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}