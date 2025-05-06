"use client"

import { useState, useEffect, useRef } from "react"
import Joyride, { type CallBackProps, STATUS, type Step } from "react-joyride"
import { HelpCircle, List, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { setCookie, getCookie, deleteCookie } from "@/lib/cookies"
import { useTheme } from "next-themes"

export function FeatureTourJoyride() {
  const [run, setRun] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [showMenu, setShowMenu] = useState(false)
  const { theme, resolvedTheme } = useTheme()
  const isDarkMode = theme === "dark" || (theme === "system" && resolvedTheme === "dark")
  const menuRef = useRef<HTMLDivElement>(null)

  // Define tour steps
  const steps: Step[] = [
    {
      target: "#header",
      content:
        "Welcome to GPA Calculator! This tool helps you calculate your semester GPA and cumulative GPA (CGPA) easily.",
      placement: "bottom",
      disableBeacon: true,
      title: "Welcome to GPA Calculator!",
    },
    {
      target: "#scale-tabs",
      content: "Choose between 5-point and 4-point grading scales based on your institution's system.",
      placement: "bottom",
      title: "Grading Scale Selection",
    },
    {
      target: ".upload-transcript-section",
      content:
        "Upload your transcript as PDF or image to automatically extract course data. Preview your file before extraction.",
      placement: "bottom",
      title: "Transcript Upload",
    },
    {
      target: "#course-input",
      content: "Enter your course name, credit units, and select your grade to calculate your GPA.",
      placement: "top",
      title: "Course Information",
    },
    {
      target: "#add-course-button",
      content: "Click here to add more courses to your GPA calculation.",
      placement: "top",
      title: "Add More Courses",
    },
    {
      target: ".course-badge",
      content: "This badge shows the number of courses you've added to your calculation.",
      placement: "bottom",
      title: "Course Counter Badge",
    },
    {
      target: "#gpa-result",
      content: "Your calculated GPA will appear here based on your course information.",
      placement: "top",
      title: "GPA Result",
    },
    {
      target: "#cgpa-section",
      content: "Track your cumulative GPA by adding previous CGPA and semester results.",
      placement: "top",
      title: "CGPA Calculator",
    },
    {
      target: "#previous-cgpa-input",
      content: "Enter your previous cumulative GPA here to calculate your updated CGPA.",
      placement: "right",
      title: "Previous CGPA",
    },
    {
      target: "#add-semester-button",
      content: "Add multiple semesters to track your academic progress over time.",
      placement: "top",
      title: "Add Semesters",
    },
    {
      target: ".semester-badge",
      content: "This badge shows the number of semesters you've added to your calculation.",
      placement: "bottom",
      title: "Semester Counter Badge",
    },
    {
      target: "#cgpa-result",
      content: "Your calculated cumulative GPA will appear here.",
      placement: "top",
      title: "CGPA Result",
    },
    {
      target: "#export-button",
      content: "Export your GPA or CGPA calculations as PDF for your records.",
      placement: "left",
      title: "Export Feature",
    },
    {
      target: "#clear-button",
      content: "Clear your calculation data when you want to start fresh.",
      placement: "left",
      title: "Clear Data",
    },
    {
      target: "#theme-toggle",
      content: "Switch between light and dark mode based on your preference.",
      placement: "left",
      title: "Theme Toggle",
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

  // Function to center the target element in the viewport
  const centerTargetInViewport = (target: HTMLElement) => {
    if (!target) return

    const rect = target.getBoundingClientRect()
    const targetCenterY = rect.top + rect.height / 2
    const viewportHeight = window.innerHeight
    const viewportCenterY = viewportHeight / 2

    // Calculate how much to scroll to center the element
    const scrollY = window.scrollY + targetCenterY - viewportCenterY

    // Smooth scroll to center the element
    window.scrollTo({
      top: scrollY,
      behavior: "smooth",
    })
  }

  // Handle tour callbacks
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, type, action, step } = data

    // Center the target element when a step is shown
    if (type === "step:before" || type === "step:after") {
      const targetElement = document.querySelector(step.target as string) as HTMLElement
      if (targetElement) {
        centerTargetInViewport(targetElement)
      }
    }

    // Update step index
    if (type === "step:after" && action === "next") {
      setStepIndex(index + 1)
    } else if (type === "step:after" && action === "prev") {
      setStepIndex(index - 1)
    } else {
      setStepIndex(index)
    }

    // Handle tour completion
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false)
    }
  }

  // Function to restart the tour
  const startTour = () => {
    // Reset the cookie to show the tour again
    deleteCookie("has_visited_before")
    setStepIndex(0)
    setRun(true)
  }

  // Jump to a specific section
  const jumpToSection = (sectionIndex: number) => {
    setStepIndex(sectionIndex)
    setShowMenu(false)

    // Ensure the tour is running
    if (!run) {
      setRun(true)
    }

    // Add a small delay to ensure the tour is properly updated
    setTimeout(() => {
      // Find the target element for this step
      const targetElement = document.querySelector(steps[sectionIndex].target as string) as HTMLElement
      if (targetElement) {
        // Scroll to the element
        centerTargetInViewport(targetElement)
      }
    }, 100)
  }

  // Get theme-appropriate colors
  const getPrimaryColor = () => {
    return isDarkMode ? "#ffffff" : "#000000"
  }

  const getBackgroundColor = () => {
    return isDarkMode ? "#1f2937" : "#ffffff"
  }

  const getTextColor = () => {
    return isDarkMode ? "#f3f4f6" : "#374151"
  }

  return (
    <>
      <Button variant="outline" size="icon" onClick={startTour} className="mr-2" aria-label="Start feature tour">
        <HelpCircle className="h-[1.2rem] w-[1.2rem]" />
      </Button>

      <Joyride
        callback={handleJoyrideCallback}
        continuous
        hideCloseButton={false}
        run={run}
        scrollToFirstStep
        scrollOffset={100} // Add some padding when scrolling
        showProgress
        showSkipButton
        stepIndex={stepIndex}
        steps={steps}
        disableOverlayClose={false}
        disableCloseOnEsc={false}
        floaterProps={{
          disableAnimation: false,
          styles: {
            floater: {
              transition: "all 0.3s ease-out",
            },
          },
        }}
        styles={{
          options: {
            zIndex: 10000,
            primaryColor: getPrimaryColor(),
            backgroundColor: getBackgroundColor(),
            textColor: getTextColor(),
            arrowColor: getBackgroundColor(),
          },
          tooltip: {
            padding: "16px",
            borderRadius: "8px",
            boxShadow: isDarkMode ? "0 0 10px rgba(0, 0, 0, 0.5)" : "0 0 10px rgba(0, 0, 0, 0.1)",
          },
          buttonNext: {
            backgroundColor: isDarkMode ? "#ffffff" : "#000000",
            color: isDarkMode ? "#000000" : "#ffffff",
          },
          buttonBack: {
            marginRight: 10,
            color: isDarkMode ? "#d1d5db" : "#6b7280",
          },
          buttonSkip: {
            color: isDarkMode ? "#d1d5db" : "#6b7280",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          spotlight: {
            borderRadius: 4,
            boxShadow: "0 0 0 999em rgba(0, 0, 0, 0.7)",
          },
          tooltipContainer: {
            textAlign: "left",
          },
          tooltipTitle: {
            margin: "0 24px 0 0", // Make room for the menu button
          },
          buttonClose: {
            color: isDarkMode ? "#d1d5db" : "#6b7280",
            top: "12px",
            right: "12px",
          },
        }}
        locale={{
          back: "Previous",
          close: "Close",
          last: "Finish",
          next: "Next",
          skip: "Skip tour",
        }}
        tooltipComponent={({
          continuous,
          index,
          step,
          backProps,
          closeProps,
          primaryProps,
          skipProps,
          tooltipProps,
        }) => (
          <div
            {...tooltipProps}
            className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 relative"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg">{step.title}</h3>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMenu(!showMenu)}
                  className="h-6 w-6 relative"
                  aria-label="Show tour sections"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  {...closeProps}
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  aria-label="Close tour"
                  onClick={(e) => {
                    setRun(false)
                    // Only call the original onClick if it exists
                    if (closeProps.onClick) {
                      closeProps.onClick(e)
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Section menu dropdown */}
            {showMenu && (
              <div
                ref={menuRef}
                className="absolute right-4 top-10 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-[300px] overflow-y-auto"
              >
                {Object.entries(tourSections).map(([section, indices]) => (
                  <div key={section} className="p-1">
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {section}
                    </div>
                    {indices.map((stepIndex) => (
                      <button
                        key={stepIndex}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                          index === stepIndex
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                        onClick={() => jumpToSection(stepIndex)}
                      >
                        {steps[stepIndex].title}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}

            <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">{step.content}</div>

            {/* Progress indicator */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-1">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full ${
                      i === index ? "w-4 bg-black dark:bg-white" : "w-1.5 bg-gray-300 dark:bg-gray-700"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {index + 1}/{steps.length}
              </span>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between">
              {index > 0 && (
                <Button {...backProps} size="sm" variant="outline" className="flex items-center">
                  Back
                </Button>
              )}
              {continuous ? (
                <Button {...primaryProps} size="sm" className="flex items-center ml-auto">
                  {index === steps.length - 1 ? "Finish" : "Next"}
                </Button>
              ) : (
                <Button {...closeProps} size="sm" className="flex items-center ml-auto">
                  Close
                </Button>
              )}
              {index < steps.length - 1 && (
                <Button {...skipProps} size="sm" variant="ghost" className="ml-2">
                  Skip
                </Button>
              )}
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
        )}
      />
    </>
  )
}
