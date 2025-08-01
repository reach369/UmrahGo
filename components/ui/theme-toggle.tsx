"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useTranslations } from 'next-intl'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle({ className = "", showDropdown = false }: {
  className?: string;
  showDropdown?: boolean;
}) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const t = useTranslations()

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark"
    setTheme(nextTheme)

    // Add smooth transition
    document.documentElement.classList.add('theme-transition')
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition')
    }, 300)
  }

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={`rounded-full w-10 h-10 ${className}`}
        disabled
      >
        <Sun className="h-5 w-5" />
      </Button>
    )
  }

  if (showDropdown) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full w-10 h-10 ${className} hover:bg-primary/10`}
            aria-label={t('theme.toggle') || 'تبديل الثيم'}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">{t('theme.toggle') || 'تبديل الثيم'}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => setTheme("light")}
            className={theme === "light" ? "bg-accent text-accent-foreground" : ""}
          >
            <Sun className="mr-2 h-4 w-4" />
            <span>{t('theme.light') || 'فاتح'}</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setTheme("dark")}
            className={theme === "dark" ? "bg-accent text-accent-foreground" : ""}
          >
            <Moon className="mr-2 h-4 w-4" />
            <span>{t('theme.dark') || 'مظلم'}</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setTheme("system")}
            className={theme === "system" ? "bg-accent text-accent-foreground" : ""}
          >
            <Monitor className="mr-2 h-4 w-4" />
            <span>{t('theme.system') || 'النظام'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={t('theme.toggle') || 'تبديل الثيم'}
      className={`rounded-full w-10 h-10 relative overflow-hidden ${className} hover:bg-primary/10 transition-colors`}
      title={resolvedTheme === 'dark' ? t('theme.light') || 'فاتح' : t('theme.dark') || 'مظلم'}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
    </Button>
  )
}