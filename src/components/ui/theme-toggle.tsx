"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // يتم استخدام هذا للتأكد من أن المكون لا يظهر مختلفًا بين الخادم والعميل
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark"
    setTheme(nextTheme)
    
    // إضافة تأثير انتقالي للجسم بأكمله
    document.documentElement.classList.add('theme-transition')
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition')
    }, 500)
  }

  if (!mounted) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="تبديل الثيم"
      className={`rounded-full w-10 h-10 relative overflow-hidden ${className} hover:bg-primary/10`}
    >
      <span className={`absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 opacity-0 transition-opacity duration-300 ${resolvedTheme === 'dark' ? 'opacity-30' : ''}`} />
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 text-primary dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 text-primary dark:rotate-0 dark:scale-100" />
    </Button>
  )
} 