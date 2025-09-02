"use client"

import { useState } from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
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
      
      <div className="flex pt-14"> {/* Add padding-top for fixed header */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={closeSidebar} 
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />
        
        {/* Main content */}
        <main className={`flex-1 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:ml-[81px]' : 'lg:ml-80'}`}>
          <div className="p-6 transition-all duration-300 ease-in-out">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}