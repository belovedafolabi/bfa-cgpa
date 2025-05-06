"use client"

import { Button } from "@/components/ui/button"

interface MobileNavigationProps {
  activeSection: string | null
  scrollToSection: (sectionId: string) => void
}

export function MobileNavigation({ activeSection, scrollToSection }: MobileNavigationProps) {
  return (
    <div className="md:hidden flex space-x-2 mb-6">
      <Button
        variant={activeSection === "gpa" ? "default" : "outline"}
        onClick={() => scrollToSection("gpa-section")}
        className="flex-1"
      >
        GPA
      </Button>
      <Button
        variant={activeSection === "cgpa" ? "default" : "outline"}
        onClick={() => scrollToSection("cgpa-section")}
        className="flex-1"
      >
        CGPA
      </Button>
    </div>
  )
}
