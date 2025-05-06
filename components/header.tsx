"use client"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/components/toast-provider"
import { FeatureTourCustom } from "@/components/feature-tour-custom"

interface HeaderProps {
  activeSection: string | null
  scrollToSection: (sectionId: string) => void
}

export function Header({ activeSection, scrollToSection }: HeaderProps) {
  const { toast } = useToast()

  return (
    <header
      id="header"
      className="flex justify-between items-center mb-8 sticky top-0 bg-background z-20 py-4 border-b border-border"
    >
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">GPA Calculator</h1>
      <div className="flex items-center space-x-2 md:space-x-4">
        <Navigation activeSection={activeSection} scrollToSection={scrollToSection} />
        <FeatureTourCustom />
        <div id="theme-toggle">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

function Navigation({ activeSection, scrollToSection }: HeaderProps) {
  return (
    <nav className="hidden md:flex space-x-4">
      <Button
        variant={activeSection === "gpa" ? "default" : "ghost"}
        onClick={() => scrollToSection("gpa-section")}
        className={activeSection === "gpa" ? "bg-foreground text-background" : ""}
      >
        GPA
      </Button>
      <Button
        variant={activeSection === "cgpa" ? "default" : "ghost"}
        onClick={() => scrollToSection("cgpa-section")}
        className={activeSection === "cgpa" ? "bg-foreground text-background" : ""}
      >
        CGPA
      </Button>
    </nav>
  )
}
