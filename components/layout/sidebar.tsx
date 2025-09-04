"use client"

import { useState } from "react"
import { 
  Home, 
  Settings, 
  FileText, 
  TrendingUp, 
  BookOpen, 
  Tag,
  ChevronDown,
  ChevronRight,
  ChevronLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const navigationItems = [
  {
    title: "Home",
    icon: Home,
    href: "/",
  },
  {
    title: "Services",
    icon: Settings,
    href: "/services",
    hasSubmenu: true,
    submenuItems: [
      { title: "Web Services", href: "/services/web" },
      { title: "API Services", href: "/services/api" },
      { title: "Cloud Services", href: "/services/cloud" },
    ]
  },
  {
    title: "Travel Advisory",
    icon: FileText,
    href: "/travel-advisory",
  },
  {
    title: "News",
    icon: TrendingUp,
    href: "/news",
  },
  {
    title: "Blog",
    icon: BookOpen,
    href: "/blog",
  },
  {
    title: "Promotions",
    icon: Tag,
    href: "/promotions",
  },
]

export function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)

  const toggleSubmenu = (title: string) => {
    if (isCollapsed) {
      onToggleCollapse()
      return
    }
    setActiveSubmenu(activeSubmenu === title ? null : title)
  }

  // On mobile (lg:hidden), always show expanded view when sidebar is open
  // On desktop (lg:static), respect the isCollapsed state  
  const shouldShowText = !isCollapsed || isOpen

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)] transform border-r bg-background transition-[width,transform] duration-200 ease-in-out lg:static lg:z-auto lg:translate-x-0 box-border",
          // On mobile, always use full width when open. On desktop, respect isCollapsed state  
          "w-[256px] lg:w-auto",
          isCollapsed && "lg:w-[81px]",
          !isCollapsed && "lg:w-[256px]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className={cn(
            "border-b h-14 flex items-center justify-center relative",
            shouldShowText ? "px-4" : ""
          )}>
            {shouldShowText && (
              <h2 className="font-bold font-nordique-pro text-center leading-none flex items-center w-24 h-[18px] text-sm">
                AppDashboard
              </h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="hidden lg:flex shrink-0 absolute right-2 h-10 w-10 items-center justify-center"
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-1">
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <li key={item.title}>
                  {item.hasSubmenu ? (
                    <Collapsible
                      open={shouldShowText && activeSubmenu === item.title}
                      onOpenChange={() => toggleSubmenu(item.title)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full hover:bg-accent",
                            shouldShowText ? "justify-start text-left" : "justify-center px-2"
                          )}
                        >
                          <item.icon className={cn("h-4 w-4", shouldShowText && "mr-3")} />
                          {shouldShowText && (
                            <>
                              <span className="flex-1">{item.title}</span>
                              {activeSubmenu === item.title ? (
                                <ChevronDown className="h-5 w-5 ml-auto" />
                              ) : (
                                <ChevronRight className="h-5 w-5 ml-auto" />
                              )}
                            </>
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className={cn("space-y-1 mt-1", shouldShowText && "ml-7")}>
                        {item.submenuItems?.map((subItem) => (
                          <Button
                            key={subItem.title}
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "w-full text-sm text-muted-foreground hover:text-foreground",
                              shouldShowText ? "justify-start" : "justify-center px-2"
                            )}
                            asChild
                          >
                            <Link href={subItem.href} onClick={onClose}>
                              {shouldShowText ? subItem.title : subItem.title.charAt(0)}
                            </Link>
                          </Button>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full hover:bg-accent",
                        shouldShowText ? "justify-start" : "justify-center px-2"
                      )}
                      asChild
                    >
                      <Link href={item.href} onClick={onClose} className="flex items-center w-full">
                        <item.icon className={cn("h-4 w-4", shouldShowText && "mr-3")} />
                        {shouldShowText && item.title}
                      </Link>
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Sidebar footer */}
          {shouldShowText && (
            <div className="p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Welcome! Please sign in to access more features.
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}