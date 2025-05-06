"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { useEffect } from "react"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Add an effect to ensure theme changes are applied to the document
  useEffect(() => {
    // Force the theme to be applied on initial load
    const theme = localStorage.getItem("theme") || "system"
    const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

    if (isDark) {
      document.documentElement.classList.add("dark")
      document.documentElement.style.setProperty("--foreground-rgb", "255, 255, 255")
      document.documentElement.style.setProperty("--background-rgb", "0, 0, 0")
    } else {
      document.documentElement.classList.remove("dark")
      document.documentElement.style.setProperty("--foreground-rgb", "0, 0, 0")
      document.documentElement.style.setProperty("--background-rgb", "255, 255, 255")
    }

    // Apply theme-specific styles to ensure proper color contrast
    document.documentElement.style.colorScheme = isDark ? "dark" : "dark"
  }, [])

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={true}
      disableTransitionOnChange={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
