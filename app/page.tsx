"use client"

import { useEffect, useState } from "react"
import { GpaCalculator } from "@/components/gpa-calculator"
import { ThemeProvider } from "@/components/theme-provider"
import { ToastProvider } from "@/components/toast-provider"
import { Header } from "@/components/header"
import { MobileNavigation } from "@/components/mobile-navigation"
import { Footer } from "@/components/footer"
import { ScrollToTopButton } from "@/components/scroll-to-top-button"
import { LoadingScreen } from "@/components/loading-screen"
import { BackgroundGrid } from "@/components/background-grid"

// Import theme transitions
import "./theme-transitions.css"

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Observer for sections
  useEffect(() => {
    // Show loading screen for 3 seconds
    const timer = setTimeout(() => {
      setLoading(false)
    }, 3000)

    // Mark as mounted for theme handling
    setMounted(true)

    // Scroll event listener
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const viewportHeight = window.innerHeight

      // Check which section is in view
      const gpaSection = document.getElementById("gpa-section")
      const cgpaSection = document.getElementById("cgpa-section")

      if (gpaSection && cgpaSection) {
        const gpaSectionTop = gpaSection.getBoundingClientRect().top
        const cgpaSectionTop = cgpaSection.getBoundingClientRect().top

        if (cgpaSectionTop < viewportHeight / 2) {
          setActiveSection("cgpa")
        } else if (gpaSectionTop < viewportHeight / 2) {
          setActiveSection("gpa")
        } else {
          setActiveSection(null)
        }
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
    }
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-background relative">
          <BackgroundGrid />
          <div className="container mx-auto px-4 py-8 relative z-10">
            <Header activeSection={activeSection} scrollToSection={scrollToSection} />

            <main>
              <MobileNavigation activeSection={activeSection} scrollToSection={scrollToSection} />
              <GpaCalculator />
            </main>

            <Footer />
          </div>

          <ScrollToTopButton />
        </div>
      </ToastProvider>
    </ThemeProvider>
  )
}
