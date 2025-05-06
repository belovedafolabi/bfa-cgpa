"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { setCookie, getCookie } from "@/lib/cookies"

interface TourStep {
  target: string
  title: string
  content: string
  placement: "top" | "bottom" | "left" | "right"
  category?: string
}

export function FeatureTour() {
  const [currentStep, setCurrentStep] = useState(0)
  const [showTour, setShowTour] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [spotlightPosition, setSpotlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 })
  const [arrowPosition, setArrowPosition] = useState({ top: 0, left: 0, rotate: 0 })
  const [isMobile, setIsMobile] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const [showStepMenu, setShowStepMenu] = useState(false)

  const popoverRef = useRef<HTMLDivElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Tour steps configuration - expanded to cover all features and categorized
  const tourSteps: TourStep[] = [
    {
      target: "header",
      title: "Welcome to GPA Calculator!",
      content: "This tool helps you calculate your semester GPA and cumulative GPA (CGPA) easily.",
      placement: "bottom",
      category: "Introduction",
    },
    {
      target: "scale-tabs",
      title: "Grading Scale Selection",
      content: "Choose between 5-point and 4-point grading scales based on your institution's system.",
      placement: "bottom",
      category: "GPA Calculator",
    },
    {
      target: "course-input",
      title: "Course Information",
      content: "Enter your course name, credit units, and select your grade to calculate your GPA.",
      placement: "top",
      category: "GPA Calculator",
    },
    {
      target: "add-course-button",
      title: "Add More Courses",
      content: "Click here to add more courses to your GPA calculation.",
      placement: "top",
      category: "GPA Calculator",
    },
    {
      target: "gpa-result",
      title: "GPA Result",
      content: "Your calculated GPA will appear here based on your course information.",
      placement: "top",
      category: "GPA Calculator",
    },
    {
      target: "cgpa-section",
      title: "CGPA Calculator",
      content: "Track your cumulative GPA by adding previous CGPA and semester results.",
      placement: "top",
      category: "CGPA Calculator",
    },
    {
      target: "previous-cgpa-input",
      title: "Previous CGPA",
      content: "Enter your previous cumulative GPA here to calculate your updated CGPA.",
      placement: "right",
      category: "CGPA Calculator",
    },
    {
      target: "add-semester-button",
      title: "Add Semesters",
      content: "Add multiple semesters to track your academic progress over time.",
      placement: "top",
      category: "CGPA Calculator",
    },
    {
      target: "cgpa-result",
      title: "CGPA Result",
      content: "Your calculated cumulative GPA will appear here.",
      placement: "top",
      category: "CGPA Calculator",
    },
    {
      target: "export-button",
      title: "Export Feature",
      content: "Export your GPA or CGPA calculations as PDF for your records.",
      placement: "left",
      category: "Tools",
    },
    {
      target: "clear-button",
      title: "Clear Data",
      content: "Clear your calculation data when you want to start fresh.",
      placement: "left",
      category: "Tools",
    },
    {
      target: "theme-toggle",
      title: "Theme Toggle",
      content: "Switch between light and dark mode based on your preference.",
      placement: "left",
      category: "Tools",
    },
  ]

  // Group steps by category
  const stepCategories = tourSteps.reduce(
    (acc, step, index) => {
      const category = step.category || "Other"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push({ ...step, index })
      return acc
    },
    {} as Record<string, (TourStep & { index: number })[]>,
  )

  // Check if user has visited before and detect mobile
  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    const hasVisited = getCookie("has_visited_before")

    // Only set state if we need to show the tour
    if (!hasVisited) {
      // Set a small delay to ensure the page is fully loaded
      const timer = setTimeout(() => {
        setShowTour(true)
        // Set cookie to remember the user has visited
        setCookie("has_visited_before", "true", 365)
      }, 1500)

      return () => {
        clearTimeout(timer)
        window.removeEventListener("resize", checkMobile)
      }
    }

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Handle keyboard navigation
  useEffect(() => {
    if (!showTour) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case "Enter":
          if (currentStep < tourSteps.length - 1) {
            setCurrentStep(currentStep + 1)
          } else {
            endTour()
          }
          break
        case "ArrowLeft":
          if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
          }
          break
        case "Escape":
          endTour()
          break
        case "m":
          setShowStepMenu(!showStepMenu)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [showTour, currentStep, tourSteps.length, showStepMenu])

  // Close menu when clicking outside
  useEffect(() => {
    if (!showStepMenu) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowStepMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showStepMenu])

  // Track scrolling state
  useEffect(() => {
    if (!showTour) return

    const handleScroll = () => {
      setIsScrolling(true)

      // Clear previous timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // Set a new timeout to detect when scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false)
        updatePositions()
      }, 150)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [showTour])

  // Position spotlight and popover when step changes
  useEffect(() => {
    if (!showTour) return

    // Scroll to the target element and update positions
    scrollToTargetAndUpdatePositions()

    // Reposition on resize
    const handleResize = () => {
      updatePositions()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [currentStep, showTour, tourSteps, isMobile])

  // Scroll to the target element and update positions
  const scrollToTargetAndUpdatePositions = () => {
    if (isScrolling) return

    const step = tourSteps[currentStep]
    const targetElement = document.querySelector(step.target) as HTMLElement

    if (!targetElement) return

    // Get the current scroll position before scrolling
    const initialScrollY = window.scrollY

    // Calculate the target element's position relative to the document
    const rect = targetElement.getBoundingClientRect()
    const targetTop = rect.top + initialScrollY

    // Calculate the center position for scrolling
    const windowHeight = window.innerHeight
    const scrollTargetY = targetTop - windowHeight / 2 + rect.height / 2

    // Set scrolling flag to prevent multiple updates
    setIsScrolling(true)

    // Scroll to the target position
    window.scrollTo({
      top: Math.max(0, scrollTargetY),
      behavior: "smooth",
    })

    // Update positions after scrolling completes
    setTimeout(() => {
      setIsScrolling(false)
      updatePositions()
    }, 600) // Increased timeout to ensure scrolling completes
  }

  // Update spotlight and popover positions
  const updatePositions = () => {
    const step = tourSteps[currentStep]
    const targetElement = document.querySelector(step.target) as HTMLElement

    if (!targetElement) return

    // Get the element's position relative to the viewport
    const rect = targetElement.getBoundingClientRect()

    // Get the current scroll position
    const scrollY = window.scrollY
    const scrollX = window.scrollX

    // Update spotlight position (viewport-relative)
    setSpotlightPosition({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    })

    // Calculate popover position based on placement
    let popoverTop = 0
    let popoverLeft = 0
    let arrowTop = 0
    let arrowLeft = 0
    let rotation = 0

    // Popover dimensions
    const popoverWidth = 300
    const popoverHeight = 220
    const arrowSize = 10
    const margin = 10

    // Adjust placement for mobile
    let placement = step.placement
    if (isMobile && (placement === "left" || placement === "right")) {
      placement = "bottom"
    }

    switch (placement) {
      case "top":
        popoverTop = rect.top - popoverHeight - margin
        popoverLeft = rect.left + rect.width / 2 - popoverWidth / 2
        arrowTop = popoverHeight
        arrowLeft = popoverWidth / 2 - arrowSize
        rotation = 180
        break
      case "bottom":
        popoverTop = rect.bottom + margin
        popoverLeft = rect.left + rect.width / 2 - popoverWidth / 2
        arrowTop = -arrowSize * 2
        arrowLeft = popoverWidth / 2 - arrowSize
        rotation = 0
        break
      case "left":
        popoverTop = rect.top + rect.height / 2 - popoverHeight / 2
        popoverLeft = rect.left - popoverWidth - margin
        arrowTop = popoverHeight / 2 - arrowSize
        arrowLeft = popoverWidth
        rotation = 90
        break
      case "right":
        popoverTop = rect.top + rect.height / 2 - popoverHeight / 2
        popoverLeft = rect.right + margin
        arrowTop = popoverHeight / 2 - arrowSize
        arrowLeft = -arrowSize * 2
        rotation = 270
        break
    }

    // Ensure popover stays within viewport
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Adjust horizontal position
    if (popoverLeft < margin) {
      const diff = margin - popoverLeft
      popoverLeft = margin
      arrowLeft -= diff
    } else if (popoverLeft + popoverWidth > viewportWidth - margin) {
      const diff = popoverLeft + popoverWidth - (viewportWidth - margin)
      popoverLeft -= diff
      arrowLeft += diff
    }

    // Adjust vertical position
    if (popoverTop < margin) {
      const diff = margin - popoverTop
      popoverTop = margin
      arrowTop -= diff
    } else if (popoverTop + popoverHeight > viewportHeight - margin) {
      const diff = popoverTop + popoverHeight - (viewportHeight - margin)
      popoverTop -= diff
      arrowTop += diff
    }

    // Update positions
    setPosition({ top: popoverTop, left: popoverLeft })
    setArrowPosition({ top: arrowTop, left: arrowLeft, rotate: rotation })
  }

  // Jump to a specific step
  const jumpToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex)
    setShowStepMenu(false)
  }

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      endTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const endTour = () => {
    setShowTour(false)
    setCurrentStep(0)
  }

  if (!showTour) return null

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-70 pointer-events-auto" onClick={endTour} />

      {/* Spotlight */}
      <motion.div
        ref={spotlightRef}
        className="absolute bg-transparent pointer-events-auto"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          top: spotlightPosition.top,
          left: spotlightPosition.left,
          width: spotlightPosition.width,
          height: spotlightPosition.height,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.5,
        }}
        style={{
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.75)",
          borderRadius: "4px",
          border: "3px solid rgba(255, 255, 255, 0.9)",
          animation: "spotlight-pulse 2s infinite",
          zIndex: 10001, // Ensure spotlight is above other elements
        }}
        onAnimationComplete={() => {
          // Force a position update after animation completes
          // This ensures the spotlight is correctly positioned
          updatePositions()
        }}
      />

      {/* Popover */}
      <AnimatePresence mode="wait">
        <motion.div
          ref={popoverRef}
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: 1,
            scale: 1,
            top: position.top,
            left: position.left,
          }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="absolute z-[10002] w-[300px] bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 pointer-events-auto"
          style={{ backdropFilter: "none" }}
        >
          {/* Arrow pointer */}
          <motion.div
            className="absolute w-0 h-0"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              top: arrowPosition.top,
              left: arrowPosition.left,
              rotate: arrowPosition.rotate,
            }}
            transition={{ duration: 0.3 }}
            style={{
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderBottom: "10px solid white",
              filter: "drop-shadow(0 -1px 1px rgba(0,0,0,0.1))",
            }}
          />

          <div className="p-4 relative z-[10002] bg-white dark:bg-gray-900 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg">{tourSteps[currentStep].title}</h3>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowStepMenu(!showStepMenu)}
                  className="h-6 w-6 relative"
                  aria-label="Show tour sections"
                  aria-expanded={showStepMenu}
                  aria-haspopup="true"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={endTour} className="h-6 w-6" aria-label="Close tour">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Step menu dropdown */}
            {showStepMenu && (
              <div
                ref={menuRef}
                className="absolute right-4 top-10 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-[300px] overflow-y-auto"
                role="menu"
              >
                {Object.entries(stepCategories).map(([category, steps]) => (
                  <div key={category} className="p-1">
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {category}
                    </div>
                    {steps.map((step) => (
                      <button
                        key={step.index}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                          currentStep === step.index
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                        onClick={() => jumpToStep(step.index)}
                        role="menuitem"
                      >
                        {step.title}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{tourSteps[currentStep].content}</p>

            {/* Progress indicator */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-1">
                {tourSteps.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`h-1.5 rounded-full ${
                      index === currentStep ? "w-4 bg-black dark:bg-white" : "w-1.5 bg-gray-300 dark:bg-gray-700"
                    }`}
                    initial={false}
                    animate={{
                      width: index === currentStep ? 16 : 6,
                      backgroundColor: index === currentStep ? "#000000" : "#d1d5db",
                    }}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {currentStep + 1}/{tourSteps.length}
              </span>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between">
              <Button
                onClick={prevStep}
                size="sm"
                variant="outline"
                disabled={currentStep === 0}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button onClick={nextStep} size="sm" className="flex items-center">
                {currentStep < tourSteps.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  "Finish"
                )}
              </Button>
            </div>

            {/* Keyboard shortcut hint */}
            <div className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400">
              Press{" "}
              <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700 font-mono text-xs">
                M
              </kbd>{" "}
              to open sections menu
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes spotlight-pulse {
          0% {
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 0 0 rgba(255, 255, 255, 0.7);
          }
          70% {
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 0 10px rgba(255, 255, 255, 0);
          }
          100% {
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 0 0 rgba(255, 255, 255, 0);
          }
        }
      `}</style>
    </div>
  )
}
