"use client"

import { useState, useEffect, useRef } from "react"
import { useShepherd } from "react-shepherd"
import { HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { setCookie, getCookie, deleteCookie } from "@/lib/cookies"
import { useTheme } from "next-themes"
// No direct import of shepherd.css
// import "shepherd.js/dist/css/shepherd.css"

export function FeatureTourShepherd() {
  const [showMenu, setShowMenu] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const { theme, resolvedTheme } = useTheme()
  const isDarkMode = theme === "dark" || (theme === "system" && resolvedTheme === "dark")
  const menuRef = useRef<HTMLDivElement>(null)
  const shepherd = useShepherd()

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

  // Initialize the tour
  useEffect(() => {
    if (!shepherd.isActive) {
      // Configure Shepherd
      shepherd.configure({
        defaultStepOptions: {
          cancelIcon: {
            enabled: false,
          },
          classes: "shepherd-theme-custom",
          scrollTo: false,
          modalOverlayOpeningRadius: 4,
        },
        useModalOverlay: true,
      })

      // Create steps
      steps.forEach((step, index) => {
        shepherd.addStep({
          id: step.id,
          attachTo: {
            element: step.target,
            on: step.placement,
          },
          beforeShowPromise: () =>
            new Promise<void>((resolve) => {
              // Find the target element
              const targetElement = document.querySelector(step.target) as HTMLElement
              if (targetElement) {
                // Center the element in the viewport
                centerTargetInViewport(targetElement)
                // Short delay to ensure scrolling is complete
                setTimeout(() => {
                  resolve()
                }, 300)
              } else {
                resolve()
              }
            }),
          buttons: [
            {
              text: "Close",
              action: shepherd.cancel,
              classes: "shepherd-button-secondary",
              secondary: true,
            },
            ...(index > 0
              ? [
                  {
                    text: "Back",
                    action: shepherd.back,
                    classes: "shepherd-button-secondary",
                    secondary: true,
                  },
                ]
              : []),
            {
              text: index === steps.length - 1 ? "Finish" : "Next",
              action: index === steps.length - 1 ? shepherd.complete : shepherd.next,
              classes: "shepherd-button-primary",
            },
          ],
          classes: "custom-shepherd-step",
          highlightClass: "highlight",
          // Custom rendering for the step content
          tippyOptions: {
            zIndex: 10000,
          },
          // Use a function to return the content to allow for dynamic updates
          text: () => {
            setCurrentStepIndex(index)
            return renderStepContent(step, index)
          },
        })
      })

      // Check if user has visited before
      const hasVisited = getCookie("has_visited_before")
      if (!hasVisited) {
        // Set a small delay to ensure the page is fully loaded
        const timer = setTimeout(() => {
          startTour()
          // Set cookie to remember the user has visited
          setCookie("has_visited_before", "true", 365)
        }, 1500)

        return () => clearTimeout(timer)
      }
    }

    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [shepherd, showMenu])

  // Function to start the tour
  const startTour = () => {
    // Reset the cookie to show the tour again
    deleteCookie("has_visited_before")
    shepherd.start()
  }

  // Jump to a specific section
  const jumpToSection = (stepIndex: number) => {
    setShowMenu(false)
    shepherd.show(steps[stepIndex].id)
  }

  // Render custom step content
  const renderStepContent = (step: (typeof steps)[0], index: number) => {
    const bgColor = isDarkMode ? "bg-gray-900" : "bg-white"
    const textColor = isDarkMode ? "text-gray-300" : "text-gray-600"
    const borderColor = isDarkMode ? "border-gray-700" : "border-gray-200"
    const buttonBgColor = isDarkMode ? "bg-gray-800" : "bg-gray-100"
    const buttonHoverColor = isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
    const activeButtonBgColor = isDarkMode ? "bg-gray-700" : "bg-gray-100"
    const menuBgColor = isDarkMode ? "bg-gray-800" : "bg-white"

    return `
      <div class="${bgColor} p-4 rounded-lg shadow-lg border ${borderColor} relative max-w-md">
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-bold text-lg ${isDarkMode ? "text-white" : "text-gray-900"}">${step.title}</h3>
          <div class="flex space-x-1">
            <button id="tour-menu-button-${index}" class="h-6 w-6 flex items-center justify-center rounded-md ${buttonBgColor} ${buttonHoverColor}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="${isDarkMode ? "text-gray-300" : "text-gray-600"}">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <button id="tour-close-button-${index}" class="h-6 w-6 flex items-center justify-center rounded-md ${buttonBgColor} ${buttonHoverColor}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="${isDarkMode ? "text-gray-300" : "text-gray-600"}">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div id="tour-menu-${index}" class="hidden absolute right-4 top-10 w-64 ${menuBgColor} rounded-md shadow-lg border ${borderColor} z-50 max-h-[300px] overflow-y-auto">
          ${Object.entries(tourSections)
            .map(
              ([section, indices]) => `
              <div class="p-1">
                <div class="px-2 py-1 text-xs font-semibold ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                } uppercase tracking-wider">
                  ${section}
                </div>
                ${indices
                  .map(
                    (stepIndex) => `
                  <button 
                    class="w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                      index === stepIndex
                        ? `${activeButtonBgColor} ${isDarkMode ? "text-white" : "text-gray-900"} font-medium`
                        : `${buttonHoverColor} ${isDarkMode ? "text-gray-300" : "text-gray-700"}`
                    }"
                    data-step-index="${stepIndex}"
                  >
                    ${steps[stepIndex].title}
                  </button>
                `,
                  )
                  .join("")}
              </div>
            `,
            )
            .join("")}
        </div>

        <div class="${textColor} text-sm mb-4">${step.content}</div>

        <!-- Progress indicator -->
        <div class="flex justify-between items-center mb-4">
          <div class="flex space-x-1">
            ${steps
              .map(
                (_, i) => `
              <div class="h-1.5 rounded-full ${
                i === index
                  ? `w-4 ${isDarkMode ? "bg-white" : "bg-black"}`
                  : `w-1.5 ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`
              }"></div>
            `,
              )
              .join("")}
          </div>
          <span class="text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}">
            ${index + 1}/${steps.length}
          </span>
        </div>

        <!-- Keyboard shortcut hint -->
        <div class="mt-3 text-xs text-center ${isDarkMode ? "text-gray-400" : "text-gray-500"}">
          Press
          <kbd class="px-1 py-0.5 ${
            isDarkMode ? "bg-gray-800" : "bg-gray-100"
          } rounded border ${borderColor} font-mono text-xs">
            M
          </kbd>
          to open sections menu
        </div>
      </div>
    `
  }

  // Add event listeners after each step is shown
  useEffect(() => {
    if (shepherd.isActive) {
      const menuButton = document.getElementById(`tour-menu-button-${currentStepIndex}`)
      const closeButton = document.getElementById(`tour-close-button-${currentStepIndex}`)
      const menu = document.getElementById(`tour-menu-${currentStepIndex}`)

      if (menuButton && menu) {
        const toggleMenu = () => {
          const isHidden = menu.classList.contains("hidden")
          if (isHidden) {
            menu.classList.remove("hidden")
          } else {
            menu.classList.add("hidden")
          }
        }

        menuButton.addEventListener("click", toggleMenu)

        // Add event listeners to all step buttons in the menu
        const stepButtons = menu.querySelectorAll("button[data-step-index]")
        stepButtons.forEach((button) => {
          button.addEventListener("click", () => {
            const stepIndex = Number.parseInt(button.getAttribute("data-step-index") || "0", 10)
            jumpToSection(stepIndex)
          })
        })

        return () => {
          menuButton.removeEventListener("click", toggleMenu)
        }
      }

      if (closeButton) {
        closeButton.addEventListener("click", () => {
          shepherd.cancel()
        })

        return () => {
          closeButton.removeEventListener("click", shepherd.cancel)
        }
      }
    }
  }, [shepherd, currentStepIndex])

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!shepherd.isActive) return

      switch (e.key) {
        case "m":
        case "M":
          const menuButton = document.getElementById(`tour-menu-button-${currentStepIndex}`)
          if (menuButton) {
            menuButton.click()
          }
          break
        case "Escape":
          shepherd.cancel()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [shepherd, currentStepIndex])

  // Add custom styles for Shepherd
  useEffect(() => {
    // Add custom styles for Shepherd
    const style = document.createElement("style")
    style.textContent = `
      .shepherd-theme-custom {
        z-index: 10000 !important;
      }
      .shepherd-element {
        max-width: 400px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
      }
      .shepherd-content {
        padding: 0 !important;
        border-radius: 8px !important;
        overflow: hidden;
      }
      .shepherd-text {
        padding: 0 !important;
      }
      .shepherd-footer {
        display: none !important;
      }
      .shepherd-modal-overlay-container {
        opacity: 0.7 !important;
      }
      .highlight {
        box-shadow: 0 0 0 4px rgba(66, 153, 225, 0.5) !important;
        border-radius: 4px !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <Button variant="outline" size="icon" onClick={startTour} className="mr-2" aria-label="Start feature tour">
      <HelpCircle className="h-[1.2rem] w-[1.2rem]" />
    </Button>
  )
}
