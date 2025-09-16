"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { 
  Home, 
  Users,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  UserCog,
  UserCheck,
  UserPlus,
  Settings,
  Shield,
  LayoutDashboard,
  FileText,
  Database,
  Cpu,
  LogOut,
  Clock,
  HardDrive
} from "lucide-react"
import { UserRole as RbacUserRole } from "@/lib/rbac"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface BaseNavigationItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  allowedRoles: string[];
  description?: string;
  className?: string;
}

interface NavigationItem extends BaseNavigationItem {
  hasSubmenu?: boolean;
  submenuItems?: BaseNavigationItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

// Helper function to create navigation items with proper typing
const createNavItem = <T extends Omit<NavigationItem, 'hasSubmenu'>>(item: T & { hasSubmenu?: boolean }): NavigationItem => ({
  hasSubmenu: false,
  ...item
});

// Define the navigation items with required roles for each item
const navigationItems: NavigationItem[] = [
  createNavItem({
    title: "Home",
    icon: Home,
    href: "/",
    allowedRoles: ['SuperAdmin', 'Admin', 'Staff', 'Partner', 'Agent', 'User']
  }),
  createNavItem({
    title: "Database Initialization",
    icon: HardDrive,
    href: "/database-init",
    allowedRoles: ['SuperAdmin'],
    description: "Initialize Firebase database"
  }),
  createNavItem({
    title: "User Management",
    icon: Users,
    href: "/user-management",
    allowedRoles: ['SuperAdmin', 'Admin', 'Staff', 'Partner', 'Agent', 'User'],
    hasSubmenu: true,
    submenuItems: [
      // All Users
      {
        title: "All",
        icon: Users,
        href: "/user-management/all",
        allowedRoles: ['SuperAdmin', 'Admin'],
        description: "Showing all users"
      },
      // Admin Category
      {
        title: "Admin",
        icon: Shield,
        href: "/user-management/admin",
        allowedRoles: ['SuperAdmin', 'Admin'],
        hasSubmenu: true,
        description: "Category level",
        submenuItems: [
          { 
            title: "SuperAdmin",
            href: "/user-management/admin/superadmin",
            icon: Shield,
            allowedRoles: ['SuperAdmin']
          },
          { 
            title: "Admin",
            href: "/user-management/admin/admin",
            icon: Shield,
            allowedRoles: ['SuperAdmin', 'Admin']
          }
        ]
      },
      // Staff Category
      {
        title: "Staff",
        icon: UserCog,
        href: "/user-management/staff",
        allowedRoles: ['SuperAdmin', 'Admin', 'Staff'],
        hasSubmenu: true,
        description: "Category level",
        submenuItems: [
          { 
            title: "Support", 
            href: "/user-management/staff/support",
            icon: UserCog,
            allowedRoles: ['SuperAdmin', 'Admin', 'Staff']
          },
          { 
            title: "Key Manager", 
            href: "/user-management/staff/key-manager",
            icon: UserCog,
            allowedRoles: ['SuperAdmin', 'Admin', 'Staff']
          },
          { 
            title: "Research", 
            href: "/user-management/staff/research",
            icon: UserCog,
            allowedRoles: ['SuperAdmin', 'Admin', 'Staff']
          },
          { 
            title: "Media", 
            href: "/user-management/staff/media",
            icon: UserCog,
            allowedRoles: ['SuperAdmin', 'Admin', 'Staff']
          },
          { 
            title: "Sales", 
            href: "/user-management/staff/sales",
            icon: UserCog,
            allowedRoles: ['SuperAdmin', 'Admin', 'Staff']
          }
        ]
      },
      // Partner Category
      {
        title: "Partner",
        icon: UserCheck,
        href: "/user-management/partner",
        allowedRoles: ['SuperAdmin', 'Admin', 'Partner'],
        hasSubmenu: true,
        description: "Category level",
        submenuItems: [
          { 
            title: "Supplier", 
            href: "/user-management/partner/supplier",
            icon: UserCheck,
            allowedRoles: ['SuperAdmin', 'Admin', 'Partner']
          },
          { 
            title: "Service Provider", 
            href: "/user-management/partner/service-provider",
            icon: UserCheck,
            allowedRoles: ['SuperAdmin', 'Admin', 'Partner']
          }
        ]
      },
      // Agent Category
      {
        title: "Agent",
        icon: UserPlus,
        href: "/user-management/agent",
        allowedRoles: ['SuperAdmin', 'Admin', 'Agent'],
        hasSubmenu: true,
        description: "Category level",
        submenuItems: [
          { 
            title: "Distributor", 
            href: "/user-management/agent/distributor",
            icon: UserPlus,
            allowedRoles: ['SuperAdmin', 'Admin', 'Agent']
          },
          { 
            title: "Franchise", 
            href: "/user-management/agent/franchise",
            icon: UserPlus,
            allowedRoles: ['SuperAdmin', 'Admin', 'Agent']
          },
          { 
            title: "B2B", 
            href: "/user-management/agent/b2b",
            icon: UserPlus,
            allowedRoles: ['SuperAdmin', 'Admin', 'Agent']
          }
        ]
      },
      // Public Users Category
      {
        title: "Users",
        icon: Users,
        href: "/user-management/users",
        allowedRoles: ['SuperAdmin', 'Admin'],
        hasSubmenu: true,
        description: "Category level",
        submenuItems: [
          { 
            title: "publicuser", 
            href: "/user-management/users/public",
            icon: Users,
            allowedRoles: ['SuperAdmin', 'Admin']
          }
        ]
      }
    ]
  })
]

export function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const [sessionTime, setSessionTime] = useState<string>('')
  const { data: session, status } = useSession()
  
  // Debug log with more details
  console.log('[SIDEBAR] Session status:', status);
  console.log('[SIDEBAR] Session data:', session);
  console.log('[SIDEBAR] Session user:', session?.user);
  
  const userRole = (session?.user as any)?.role as RbacUserRole || 'User'
  console.log('[SIDEBAR] User role:', userRole);

  // Session time tracking
  useEffect(() => {
    if (!session?.user) return

    const updateSessionTime = () => {
      const now = new Date()
      const sessionStart = new Date(session.expires ? new Date(session.expires).getTime() - 24 * 60 * 60 * 1000 : now)
      const diffMs = now.getTime() - sessionStart.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      
      if (diffHours > 0) {
        setSessionTime(`${diffHours}h ${diffMinutes}m`)
      } else {
        setSessionTime(`${diffMinutes}m`)
      }
    }

    updateSessionTime()
    const interval = setInterval(updateSessionTime, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [session])

  // Helper function to get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SuperAdmin':
        return 'bg-red-100 text-red-800'
      case 'Admin':
        return 'bg-orange-100 text-orange-800'
      case 'Support':
      case 'Key Manager':
      case 'Research':
      case 'Media':
      case 'Sales':
        return 'bg-blue-100 text-blue-800'
      case 'Supplier':
      case 'Service Provider':
        return 'bg-purple-100 text-purple-800'
      case 'Distributor':
      case 'Franchise':
      case 'B2B':
        return 'bg-green-100 text-green-800'
      case 'User':
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Helper function to get category from role
  const getCategoryFromRole = (role: string): string => {
    switch (role) {
      case 'SuperAdmin':
      case 'Admin':
        return 'Admin'
      case 'Support':
      case 'Key Manager':
      case 'Research':
      case 'Media':
      case 'Sales':
        return 'Staff'
      case 'Supplier':
      case 'Service Provider':
        return 'Partner'
      case 'Distributor':
      case 'Franchise':
      case 'B2B':
        return 'Agent'
      case 'User':
      default:
        return 'Users'
    }
  }
  
  // Filter navigation items based on user role and permissions
  const filteredNavigationItems = navigationItems.filter(item => {
    if (!item.allowedRoles) return true
    // Don't filter anything if session is still loading
    if (status === 'loading') return true
    return item.allowedRoles.includes(userRole)
  })

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
          "fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)] transform border-r bg-background transition-[width,transform] duration-200 ease-in-out box-border",
          // On mobile, always use full width when open. On desktop, respect isCollapsed state  
          "w-[256px] lg:w-auto",
          isCollapsed && "lg:w-[81px]",
          !isCollapsed && "lg:w-[256px]",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
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
              className={cn(
                "hidden lg:flex shrink-0 h-10 w-10 items-center justify-center",
                shouldShowText ? "absolute right-2" : "relative"
              )}
            >
              {isCollapsed ? (
                <ChevronsRight className="h-5 w-5" />
              ) : (
                <ChevronsLeft className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-1">
            <ul className="space-y-1">
              {filteredNavigationItems.map((item) => (
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
                              <div className="flex-1">
                                <div className="font-medium">{item.title}</div>
                                {item.description && (
                                  <div className="text-xs text-muted-foreground">
                                    {item.description}
                                  </div>
                                )}
                              </div>
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

          {/* Sidebar footer - User Profile */}
          <div className="border-t">
            {session?.user?.email ? (
              shouldShowText ? (
                <div className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm">
                        {(session.user.name || session.user.email || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {session.user.name || session.user.email?.split('@')[0] || 'User'}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {session.user.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs ${getRoleColor(userRole)}`}>
                        {userRole}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {getCategoryFromRole(userRole)}
                      </span>
                    </div>
                    
                    {sessionTime && (
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Session: {sessionTime}</span>
                      </div>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard">Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={async () => { await signOut({ callbackUrl: '/auth' }) }}>
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ) : (
                <div className="p-2 flex justify-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-sm">
                            {(session.user.name || session.user.email || "U").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      <div className="px-3 py-2 border-b">
                        <div className="text-sm font-medium">
                          {session.user.name || session.user.email?.split('@')[0] || 'User'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {session.user.email}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={`text-xs ${getRoleColor(userRole)}`}>
                            {userRole}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {getCategoryFromRole(userRole)}
                          </span>
                        </div>
                        {sessionTime && (
                          <div className="flex items-center space-x-1 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Session: {sessionTime}</span>
                          </div>
                        )}
                      </div>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={async () => { await signOut({ callbackUrl: '/auth' }) }}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            ) : (
              shouldShowText && (
                <div className="p-4">
                  <p className="text-sm text-muted-foreground">
                    Welcome! Please sign in to access features.
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </aside>
    </>
  )
}