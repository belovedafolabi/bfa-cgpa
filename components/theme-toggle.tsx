"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // After mounting, we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  // Force theme change to take effect
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)

    // Force a re-render after theme change
    setTimeout(() => {
      document.body.classList.remove("light", "dark")
      document.body.classList.add(
        newTheme === "system"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : newTheme,
      )

      // Apply theme-specific styles to ensure proper color contrast
      if (
        newTheme === "light" ||
        (newTheme === "system" && !window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        document.documentElement.style.setProperty("--foreground-rgb", "0, 0, 0")
        document.documentElement.style.setProperty("--background-rgb", "255, 255, 255")
      } else {
        document.documentElement.style.setProperty("--foreground-rgb", "255, 255, 255")
        document.documentElement.style.setProperty("--background-rgb", "0, 0, 0")
      }
    }, 0)
  }

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="h-10 w-10" aria-label="Toggle theme">
        <div className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    )
  }

  // Determine which icon to show based on the current theme
  const currentTheme = theme === "system" ? resolvedTheme : theme

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 bg-background border-border"
          id="theme-toggle"
          aria-label="Select theme"
        >
          {currentTheme === "dark" ? (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* <DropdownMenuItem onClick={() => handleThemeChange("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem> */}
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        {/* <DropdownMenuItem onClick={() => handleThemeChange("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
