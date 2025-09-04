"use client"

import { Search, Moon, Sun, Menu, User, Globe, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { useLanguage } from "@/hooks/use-language"
import { useState, useEffect, memo, useCallback } from "react"
import Link from "next/link"

interface HeaderProps {
  onSidebarToggle: () => void
  isSidebarOpen: boolean
  sidebarCollapsed: boolean
}

const Header = memo(function Header({ onSidebarToggle, isSidebarOpen, sidebarCollapsed }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { currentLanguage, languages, changeLanguage } = useLanguage()
  const [isClient, setIsClient] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)

  // Simple client check without complex state management
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleThemeToggle = useCallback(() => {
    setTheme?.(theme === "dark" ? "light" : "dark")
  }, [theme, setTheme])

  const toggleMobileSearch = useCallback(() => {
    setIsMobileSearchOpen(prev => !prev)
  }, [])

  return (
    <>
      <header className="header-container fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="header-content relative flex h-14 items-center justify-between px-4 lg:px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden mr-2"
          onClick={onSidebarToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <div className={`flex items-center`}>
          <h1 className="font-bold font-nordique-pro w-[118px] h-6 flex items-center text-base leading-none">AppDashboard</h1>
        </div>

        {/* Search - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-auto z-10">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-10 bg-muted/50 border-0"
            />
          </div>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center space-x-2 ml-auto z-10">
          {/* Search - Mobile */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileSearch}>
            <Search className="h-5 w-5" />
          </Button>

          {/* Language selector - always show placeholder, enhance when client ready */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="transition-opacity duration-300 ease-in-out"
                disabled={!isClient}
              >
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            {isClient && (
              <DropdownMenuContent align="end" className="w-48">
                {(languages || []).map((language) => (
                  <DropdownMenuItem
                    key={language.code}
                    onClick={() => changeLanguage?.(language.code)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <span className="text-lg">{language.flag}</span>
                    <span className="flex-1">{language.name}</span>
                    {currentLanguage === language.code && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            )}
          </DropdownMenu>

          {/* Theme toggle - always visible with fallback */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleThemeToggle}
            className="transition-transform duration-200 ease-in-out"
            aria-label="Toggle theme"
          >
            <div className="relative w-5 h-5">
              {isClient ? (
                <>
                  <Sun className={`absolute h-5 w-5 transition-[transform,opacity] duration-200 ease-in-out ${theme === "dark" ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
                  <Moon className={`absolute h-5 w-5 transition-[transform,opacity] duration-200 ease-in-out ${theme === "dark" ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`} />
                </>
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </div>
          </Button>

          {/* Auth buttons - show on md and up */}
          <div className="hidden md:flex items-center space-x-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/auth?mode=register">Register</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/auth?mode=sign-in">Sign In</Link>
            </Button>
          </div>

          {/* Mobile user menu - show below md */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="User menu">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 md:hidden">
              <DropdownMenuItem asChild>
                <Link href="/auth?mode=sign-in">Sign In</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/auth?mode=register">Registration</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>

    {/* Mobile Search Dropdown - Optimized */}
    {isMobileSearchOpen && (
      <div className="fixed top-14 left-0 right-0 z-[60] bg-background border-b shadow-md md:hidden">
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-10 pr-10 bg-muted/50 border-0 h-9"
              autoFocus
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute right-0 top-0 h-9 w-9 flex items-center justify-center"
              onClick={toggleMobileSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  )
})

Header.displayName = 'Header'

export { Header }