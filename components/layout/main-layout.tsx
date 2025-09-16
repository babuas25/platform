"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"

// Dynamically import components with SSR disabled to prevent hydration issues
const Header = dynamic(() => import("./header").then(mod => ({ default: mod.Header })), {
  ssr: false,
  loading: () => <div className="fixed top-0 left-0 right-0 h-14 bg-background border-b z-50"></div>
})

const Sidebar = dynamic(() => import("./sidebar").then(mod => ({ default: mod.Sidebar })), {
  ssr: false
})

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
          sidebarCollapsed ? "lg:ml-[81px]" : "lg:ml-[256px]",
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