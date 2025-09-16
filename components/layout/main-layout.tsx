"use client"

import { useState } from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { ClientOnly } from "@/components/providers/client-only-provider"
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

  // Server-safe fallback that matches what the client will initially render
  const ServerFallback = () => (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 h-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b z-50">
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center">
            <h1 className="font-bold font-nordique-pro w-[118px] h-6 flex items-center text-base leading-none">AppDashboard</h1>
          </div>
        </div>
      </div>
      <div className="pt-14">
        <main className="min-h-[calc(100vh-3.5rem)] overflow-x-auto lg:ml-[81px] ml-0">
          <div className={cn("p-6 w-full", contentClassName)}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )

  return (
    <ClientOnly fallback={<ServerFallback />}>
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
    </ClientOnly>
  )
}