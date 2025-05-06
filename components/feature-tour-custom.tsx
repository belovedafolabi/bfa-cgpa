"use client"

import { useState, useEffect, useRef } from "react"
import { HelpCircle, List, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { setCookie, getCookie } from "@/lib/cookies"
import { useTheme } from "next-themes"

export function FeatureTourCustom() {
  const [run, setRun] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [showMenu, setShowMenu] = useState(false)
  const { theme, resolvedTheme } = useTheme()
  const isDarkMode = theme === "dark" || (theme === "system" && resolvedTheme === "dark")
  const menuRef = useRef<HTMLDivElement>(null)
  const tourRef = useRef<HTMLDivElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const scrollListenerRef = useRef<number | null>(null)
  const resizeListenerRef = useRef<number | null>(null)
  const currentTargetRef = useRef<HTMLElement | null>(null)
  const [animationDirection, setAnimationDirection] = useState<"forward" | "backward">("forward")

  // Define tour steps
  const steps = [
    {
      id: "welcome",
      target: "#header",
      title: "Welcome to GPA Calculator!",
      content: "This tool helps you calculate your semester GPA and cumulative GPA (CGPA) easily.",
      placement: "bottom",
      category: "Getting Started",
    },
    {
      id: "scale-tabs",
      target: "#scale-tabs",
      title: "Grading Scale Selection",
      content: "Choose between 5-point and 4-point grading scales based on your institution's system.",
      placement: "bottom",
      category: "Getting Started",
    },
    {
      id: "transcript-upload",
      target: ".upload-transcript-section",
      title: "Transcript Upload",
      content:
        "Upload your transcript as PDF or image to automatically extract course data. Preview your file before extraction.",
      placement: "bottom",
      category: "GPA Calculator",
    },
    {
      id: "course-input",
      target: "#course-input",
      title: "Course Information",
      content: "Enter your course name, credit units, and select your grade to calculate your GPA.",
      placement: "top",
      category: "GPA Calculator",
    },
    {
      id: "add-course",
      target: "#add-course-button",
      title: "Add More Courses",
      content: "Click here to add more courses to your GPA calculation.",
      placement: "top",
      category: "GPA Calculator",
    },
    {
      id: "course-badge",
      target: ".course-badge",
      title: "Course Counter Badge",
      content: "This badge shows the number of courses you've added to your calculation.",
      placement: "bottom",
      category: "GPA Calculator",
    },
    {
      id: "gpa-result",
      target: "#gpa-result",
      title: "GPA Result",
      content: "Your calculated GPA will appear here based on your course information.",
      placement: "top",
      category: "GPA Calculator",
    },
    {
      id: "cgpa-section",
      target: "#cgpa-section",
      title: "CGPA Calculator",
      content: "Track your cumulative GPA by adding previous CGPA and semester results.",
      placement: "top",
      category: "CGPA Calculator",
    },
    {
      id: "previous-cgpa",
      target: "#previous-cgpa-input",
      title: "Previous CGPA",
      content: "Enter your previous cumulative GPA here to calculate your updated CGPA.",
      placement: "right",
      category: "CGPA Calculator",
    },
    {
      id: "add-semester",
      target: "#add-semester-button",
      title: "Add Semesters",
      content: "Add multiple semesters to track your academic progress over time.",
      placement: "top",
      category: "CGPA Calculator",
    },
    {
      id: "semester-badge",
      target: ".semester-badge",
      title: "Semester Counter Badge",
      content: "This badge shows the number of semesters you've added to your calculation.",
      placement: "bottom",
      category: "CGPA Calculator",
    },
    {
      id: "cgpa-result",
      target: "#cgpa-result",
      title: "CGPA Result",
      content: "Your calculated cumulative GPA will appear here.",
      placement: "top",
      category: "CGPA Calculator",
    },
    {
      id: "export-button",
      target: "#export-button",
      title: "Export Feature",
      content: "Export your GPA or CGPA calculations as PDF for your records.",
      placement: "left",
      category: "Tools & Features",
    },
    {
      id: "clear-button",
      target: "#clear-button",
      title: "Clear Data",
      content: "Clear your calculation data when you want to start fresh.",
      placement: "left",
      category: "Tools & Features",
    },
    {
      id: "theme-toggle",
      target: "#theme-toggle",
      title: "Theme Toggle",
      content: "Switch between light and dark mode based on your preference.",
      placement: "left",
      category: "Tools & Features",
    },
  ]

  // Group steps by category for the menu
  const tourSections = {
    "Getting Started": [0, 1],
    "GPA Calculator": [2, 3, 4, 5, 6],
    "CGPA Calculator": [7, 8, 9, 10, 11],
    "Tools & Features": [12, 13, 14],
  }

  // Check if user has visited before
  useEffect(() => {
    const hasVisited = getCookie("has_visited_before")
    if (!hasVisited) {
      // Set a small delay to ensure the page is fully loaded
      const timer = setTimeout(() => {
        setRun(true)
        // Set cookie to remember the user has visited
        setCookie("has_visited_before", "true", 365)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showMenu])

  // Handle keyboard navigation
  useEffect(() => {
    if (!run) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case "Enter":
          if (stepIndex < steps.length - 1) {
            setStepIndex(stepIndex + 1)
          } else {
            endTour()
          }
          break
        case "ArrowLeft":
          if (stepIndex > 0) {
            setStepIndex(stepIndex - 1)
          }
          break
        case "Escape":
          endTour()
          break
        case "m":
        case "M":
          setShowMenu(!showMenu)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [run, stepIndex, showMenu])

  // Debounce function for scroll and resize events
  const debounce = (func: Function, wait: number) => {
    let timeout: number | null = null

    return (...args: any[]) => {
      if (timeout !== null) {
        window.cancelAnimationFrame(timeout)
      }
      timeout = window.requestAnimationFrame(() => {
        func(...args)
        timeout = null
      })
    }
  }

  // Scroll the page to show the target element
  const scrollToTarget = (targetElement: HTMLElement) => {
    if (!targetElement) return

    // Store the current target for position updates
    currentTargetRef.current = targetElement

    const rect = targetElement.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth

    // Determine if we need to adjust for mobile
    const isMobile = viewportWidth < 768

    // Calculate ideal position: element vertically centered in viewport
    // For mobile, we want to position the element a bit higher to make room for the tooltip
    const verticalOffset = isMobile ? viewportHeight * 0.3 : viewportHeight * 0.5
    const idealScrollY = window.scrollY + rect.top + rect.height / 2 - verticalOffset

    // Smooth scroll to the ideal position
    window.scrollTo({
      top: Math.max(0, idealScrollY),
      behavior: "smooth",
    })

    // After scrolling, update positions
    setTimeout(() => {
      updatePositions()
    }, 500)
  }

  // Update spotlight and tooltip positions
  const updatePositions = () => {
    if (!run || !currentTargetRef.current) return

    const step = steps[stepIndex]
    const targetElement = currentTargetRef.current

    if (!targetElement || !tourRef.current || !spotlightRef.current) return

    // Get the element's position relative to the viewport
    const rect = targetElement.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Determine if we need to adjust for mobile
    const isMobile = viewportWidth < 768

    // Add padding to the spotlight to ensure it fully encompasses the element
    const padding = 10 // 10px padding around the element

    // Position spotlight with padding - relative to viewport
    spotlightRef.current.style.top = `${rect.top - padding}px`
    spotlightRef.current.style.left = `${rect.left - padding}px`
    spotlightRef.current.style.width = `${rect.width + padding * 2}px`
    spotlightRef.current.style.height = `${rect.height + padding * 2}px`

    // Add this line after setting the spotlight position and dimensions
    if (spotlightRef.current) {
      spotlightRef.current.classList.add("spotlight-pulse")
    }

    // Position tooltip based on placement and available space
    const tooltipWidth = isMobile ? Math.min(320, viewportWidth - 40) : 320 // Responsive width
    const tooltipHeight = 280 // Base height
    const margin = isMobile ? 15 : 20 // Smaller margin on mobile

    let tooltipTop = 0
    let tooltipLeft = 0
    let arrowPosition = { top: 0, left: 0, direction: "top" }

    // Determine the best placement based on available space
    const availableSpace = {
      top: rect.top,
      right: viewportWidth - rect.right,
      bottom: viewportHeight - rect.bottom,
      left: rect.left,
    }

    // For mobile devices, prefer top or bottom placement
    let effectivePlacement = step.placement
    if (isMobile) {
      if (step.placement === "left" || step.placement === "right") {
        // On mobile, convert left/right to top/bottom based on available space
        effectivePlacement = availableSpace.bottom > availableSpace.top ? "bottom" : "top"
      }
    } else {
      // For desktop, use smart placement based on available space
      if (step.placement === "top" && availableSpace.top < tooltipHeight + margin) {
        effectivePlacement = "bottom"
      } else if (step.placement === "bottom" && availableSpace.bottom < tooltipHeight + margin) {
        effectivePlacement = "top"
      } else if (step.placement === "left" && availableSpace.left < tooltipWidth + margin) {
        effectivePlacement = "right"
      } else if (step.placement === "right" && availableSpace.right < tooltipWidth + margin) {
        effectivePlacement = "left"
      }
    }

    // Calculate tooltip position based on effective placement
    switch (effectivePlacement) {
      case "top":
        tooltipTop = rect.top - tooltipHeight - margin
        tooltipLeft = rect.left + rect.width / 2 - tooltipWidth / 2
        arrowPosition = { top: tooltipHeight, left: tooltipWidth / 2, direction: "bottom" }
        break
      case "bottom":
        tooltipTop = rect.bottom + margin
        tooltipLeft = rect.left + rect.width / 2 - tooltipWidth / 2
        arrowPosition = { top: -10, left: tooltipWidth / 2, direction: "top" }
        break
      case "left":
        tooltipTop = rect.top + rect.height / 2 - tooltipHeight / 2
        tooltipLeft = rect.left - tooltipWidth - margin
        arrowPosition = { top: tooltipHeight / 2, left: tooltipWidth, direction: "right" }
        break
      case "right":
        tooltipTop = rect.top + rect.height / 2 - tooltipHeight / 2
        tooltipLeft = rect.right + margin
        arrowPosition = { top: tooltipHeight / 2, left: -10, direction: "left" }
        break
    }

    // Ensure tooltip stays within viewport
    if (tooltipLeft < margin) {
      const offset = margin - tooltipLeft
      tooltipLeft = margin
      arrowPosition.left -= offset
    } else if (tooltipLeft + tooltipWidth > viewportWidth - margin) {
      const offset = tooltipLeft + tooltipWidth - (viewportWidth - margin)
      tooltipLeft = viewportWidth - tooltipWidth - margin
      arrowPosition.left += offset
    }

    if (tooltipTop < margin) {
      const offset = margin - tooltipTop
      tooltipTop = margin
      arrowPosition.top -= offset
    } else if (tooltipTop + tooltipHeight > viewportHeight - margin) {
      const offset = tooltipTop + tooltipHeight - (viewportHeight - margin)
      tooltipTop = viewportHeight - tooltipHeight - margin
      arrowPosition.top += offset
    }

    // Apply tooltip position
    if (tourRef.current) {
      tourRef.current.style.top = `${tooltipTop}px`
      tourRef.current.style.left = `${tooltipLeft}px`
      tourRef.current.style.width = `${tooltipWidth}px`
      tourRef.current.style.maxWidth = `${tooltipWidth}px`

      // Add arrow to tooltip
      const arrowElement = tourRef.current.querySelector(".tooltip-arrow") as HTMLElement
      if (arrowElement) {
        arrowElement.style.top = `${arrowPosition.top}px`
        arrowElement.style.left = `${arrowPosition.left}px`

        // Reset all arrow classes
        arrowElement.classList.remove("arrow-top", "arrow-bottom", "arrow-left", "arrow-right")
        // Add the appropriate arrow class
        arrowElement.classList.add(`arrow-${arrowPosition.direction}`)
      }
    }
  }

  // Set up scroll and resize listeners
  useEffect(() => {
    if (!run) return

    // Find the target element for the current step
    const targetElement = document.querySelector(steps[stepIndex].target) as HTMLElement
    if (targetElement) {
      // Store the current target
      currentTargetRef.current = targetElement

      // Scroll to the target element
      scrollToTarget(targetElement)

      // Set up scroll and resize listeners with debouncing
      const handleScroll = debounce(() => {
        updatePositions()
      }, 10)

      const handleResize = debounce(() => {
        updatePositions()
      }, 10)

      window.addEventListener("scroll", handleScroll)
      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("scroll", handleScroll)
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [run, stepIndex])

  // Update when step changes
  useEffect(() => {
    if (!run) return

    // Find the target element for the current step
    const targetElement = document.querySelector(steps[stepIndex].target) as HTMLElement
    if (targetElement) {
      // Store the current target
      currentTargetRef.current = targetElement

      // Scroll to the target element
      scrollToTarget(targetElement)
    }
  }, [stepIndex, run])

  // Cleanup when tour ends
  useEffect(() => {
    return () => {
      // Cancel any pending animation frames
      if (scrollListenerRef.current) {
        window.cancelAnimationFrame(scrollListenerRef.current)
      }
      if (resizeListenerRef.current) {
        window.cancelAnimationFrame(resizeListenerRef.current)
      }
    }
  }, [])

  // Jump to a specific section
  const jumpToSection = (sectionIndex: number) => {
    setAnimationDirection(sectionIndex > stepIndex ? "forward" : "backward")
    setStepIndex(sectionIndex)
    setShowMenu(false)
  }

  const nextStep = () => {
    if (stepIndex < steps.length - 1) {
      setAnimationDirection("forward")
      setStepIndex(stepIndex + 1)
    } else {
      endTour()
    }
  }

  const prevStep = () => {
    if (stepIndex > 0) {
      setAnimationDirection("backward")
      setStepIndex(stepIndex - 1)
    }
  }

  const startTour = () => {
    setRun(true)
    setStepIndex(0)
  }

  const endTour = () => {
    setRun(false)
    setShowMenu(false)
    currentTargetRef.current = null
  }

  if (!run) {
    return (
      <Button variant="outline" size="icon" onClick={startTour} className="mr-2" aria-label="Start feature tour">
        <HelpCircle className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    )
  }

  return (
    <>
      <Button variant="outline" size="icon" onClick={startTour} className="mr-2" aria-label="Start feature tour">
        <HelpCircle className="h-[1.2rem] w-[1.2rem]" />
      </Button>

      {run && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[9999] pointer-events-none"
          style={{ overscrollBehavior: "contain" }}
        >
          {/* Semi-transparent overlay */}
          <div
            className="absolute inset-0 bg-black bg-opacity-70 pointer-events-auto"
            onClick={endTour}
            style={{ touchAction: "none" }}
          />

          {/* Spotlight */}
          <div
            ref={spotlightRef}
            className="absolute bg-transparent pointer-events-auto"
            style={{
              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.75)",
              borderRadius: "4px",
              border: "3px solid rgba(255, 255, 255, 0.9)",
              zIndex: 10001,
              transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />

          {/* Tooltip */}
          <div
            ref={tourRef}
            key={`tooltip-${stepIndex}`}
            className="absolute z-[10002] bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 pointer-events-auto tooltip-enter"
            style={{
              transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
              width: "320px",
              maxWidth: "calc(100vw - 40px)",
            }}
          >
            {/* Tooltip arrow */}
            <div
              className="tooltip-arrow absolute w-0 h-0 border-solid border-transparent"
              style={{
                borderWidth: "10px",
                zIndex: 10003,
              }}
            />

            <div className="p-4 relative z-[10002] overflow-hidden">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">{steps[stepIndex].title}</h3>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowMenu(!showMenu)}
                    className="h-6 w-6 relative"
                    aria-label="Show tour sections"
                    aria-expanded={showMenu}
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
              {showMenu && (
                <div
                  ref={menuRef}
                  className="absolute right-4 top-10 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
                  role="menu"
                >
                  {Object.entries(tourSections).map(([category, indices]) => (
                    <div key={category} className="p-1">
                      <div className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {category}
                      </div>
                      {indices.map((index) => (
                        <button
                          key={index}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                            stepIndex === index
                              ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                              : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                          onClick={() => jumpToSection(index)}
                          role="menuitem"
                        >
                          {steps[index].title}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Animated content */}
              <div
                key={stepIndex}
                className={`animate-in duration-300 ${
                  animationDirection === "forward" ? "slide-in-from-right-5" : "slide-in-from-left-5"
                }`}
              >
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{steps[stepIndex].content}</p>
              </div>

              {/* Progress indicator with animation */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-1 overflow-x-auto pb-1 max-w-[200px]">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 rounded-full flex-shrink-0 transition-all duration-300 ${
                        index === stepIndex
                          ? "w-4 bg-black dark:bg-white"
                          : index < stepIndex
                            ? "w-1.5 bg-gray-500 dark:bg-gray-500"
                            : "w-1.5 bg-gray-300 dark:bg-gray-700"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                  {stepIndex + 1}/{steps.length}
                </span>
              </div>

              {/* Navigation buttons with hover animations */}
              <div className="flex justify-between">
                <Button
                  onClick={prevStep}
                  size="sm"
                  variant="outline"
                  disabled={stepIndex === 0}
                  className="flex items-center transition-transform hover:translate-x-[-2px] active:translate-y-[1px]"
                >
                  Previous
                </Button>
                <Button
                  onClick={nextStep}
                  size="sm"
                  className="flex items-center transition-transform hover:translate-x-[2px] active:translate-y-[1px]"
                >
                  {stepIndex < steps.length - 1 ? "Next" : "Finish"}
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
          </div>
        </div>
      )}

      {/* CSS for tooltip arrows */}
      <style jsx global>{`
        .arrow-top {
          border-bottom-color: white !important;
          margin-top: -10px;
        }
        .dark .arrow-top {
          border-bottom-color: #1f2937 !important;
        }
        
        .arrow-bottom {
          border-top-color: white !important;
          margin-bottom: -10px;
        }
        .dark .arrow-bottom {
          border-top-color: #1f2937 !important;
        }
        
        .arrow-left {
          border-right-color: white !important;
          margin-left: -10px;
        }
        .dark .arrow-left {
          border-right-color: #1f2937 !important;
        }
        
        .arrow-right {
          border-left-color: white !important;
          margin-right: -10px;
        }
        .dark .arrow-right {
          border-left-color: #1f2937 !important;
        }

        /* Add these to the style jsx global section */
        @keyframes pulse-border {
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

        .spotlight-pulse {
          animation: pulse-border 2s infinite;
        }

        /* Tooltip entrance/exit animations */
        @keyframes fade-in-scale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fade-out-scale {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.95);
          }
        }

        .tooltip-enter {
          animation: fade-in-scale 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .tooltip-exit {
          animation: fade-out-scale 0.2s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>
    </>
  )
}
