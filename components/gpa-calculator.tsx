"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { z } from "zod"
import { Plus, Trash2, FileDown, RefreshCw, BookOpen, GraduationCap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useInView } from "framer-motion"
import jsPDF from "jspdf"
import "jspdf-autotable"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PdfPreview } from "@/components/pdf-preview"
import { useToast } from "@/components/toast-provider"
import { setCookie, getCookie, deleteCookie } from "@/lib/cookies"
import { FileUpload } from "@/components/file-upload"
import { FileUploadPdfOnly } from "@/components/file-upload-pdf-only"

// Define schemas for validation
const courseSchema = (maxGrade: number) =>
  z.object({
    name: z.string().optional(),
    creditUnits: z.number().min(1, "Credit units must be at least 1"),
    gradePoint: z
      .number()
      .min(0, "Grade point must be at least 0")
      .max(maxGrade, `Grade point must not exceed ${maxGrade}`),
  })

const semesterSchema = z.object({
  gpa: z.number().min(0, "GPA must be at least 0").max(5, "GPA must not exceed 5"),
  totalCreditUnits: z.number().min(1, "Total credit units must be at least 1"),
})

type Course = {
  id: string
  name: string
  creditUnits: number
  gradePoint: number
  error?: {
    creditUnits?: string
    gradePoint?: string
  }
  isNew?: boolean // Flag to highlight newly added courses
}

type Semester = {
  id: string
  gpa: number
  totalCreditUnits: number
  error?: {
    gpa?: string
    totalCreditUnits?: string
  }
}

// Cookie names
const COOKIE_NAMES = {
  ACTIVE_TAB: "gpa_calculator_active_tab",
  COURSES: "gpa_calculator_courses",
  PREVIOUS_CGPA: "gpa_calculator_previous_cgpa",
  PREVIOUS_CREDITS: "gpa_calculator_previous_credits",
  SEMESTERS: "gpa_calculator_semesters",
}

export function GpaCalculator() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("five-point")
  // Use active scale for CGPA calculations
  const maxGrade = activeTab === "five-point" ? 5 : 4

  // GPA calculation state
  const [courses, setCourses] = useState<Course[]>([{ id: "1", name: "Course 1", creditUnits: 3, gradePoint: 0 }])

  // CGPA calculation state
  const [previousCGPA, setPreviousCGPA] = useState(0)
  const [previousTotalCredits, setPreviousTotalCredits] = useState(0)
  const [semesters, setSemesters] = useState<Semester[]>([{ id: "1", gpa: 0, totalCreditUnits: 0 }])

  // PDF preview state
  const [showGpaPreview, setShowGpaPreview] = useState(false)
  const [showCgpaPreview, setShowCgpaPreview] = useState(false)
  const [pdfContent, setPdfContent] = useState<any>(null)

  // Refs for scroll sections
  const gpaRef = useRef(null)
  const cgpaRef = useRef(null)

  // Animation refs
  const gpaInView = useInView(gpaRef, { once: true, amount: 0.3 })
  const cgpaInView = useInView(cgpaRef, { once: true, amount: 0.3 })

  // Check if GPA calculation is valid
  const isGpaValid = courses.some((course) => course.creditUnits > 0 && course.gradePoint > 0)

  // Check if CGPA calculation is valid
  const isCgpaValid =
    (previousCGPA > 0 && previousTotalCredits > 0) ||
    semesters.some((semester) => semester.gpa > 0 && semester.totalCreditUnits > 0)

  // Load data from cookies on initial render
  useEffect(() => {
    // Show cookie notification
    const cookieNotificationShown = getCookie("cookie_notification_shown")
    if (!cookieNotificationShown) {
      toast({
        title: "Cookie Notice",
        description: "This site uses cookies to enhance your experience and save your calculator data.",
        variant: "default",
        duration: 15000, // 15 seconds
      })
      setCookie("cookie_notification_shown", "true", 30)
    }

    // Load saved data
    const savedTab = getCookie(COOKIE_NAMES.ACTIVE_TAB)
    if (savedTab) {
      setActiveTab(savedTab)
    }

    const savedCourses = getCookie(COOKIE_NAMES.COURSES)
    if (savedCourses) {
      try {
        setCourses(JSON.parse(savedCourses))
      } catch (error) {
        console.error("Error parsing saved courses:", error)
      }
    }

    const savedPreviousCGPA = getCookie(COOKIE_NAMES.PREVIOUS_CGPA)
    if (savedPreviousCGPA) {
      setPreviousCGPA(Number(savedPreviousCGPA))
    }

    const savedPreviousCredits = getCookie(COOKIE_NAMES.PREVIOUS_CREDITS)
    if (savedPreviousCredits) {
      setPreviousTotalCredits(Number(savedPreviousCredits))
    }

    const savedSemesters = getCookie(COOKIE_NAMES.SEMESTERS)
    if (savedSemesters) {
      try {
        setSemesters(JSON.parse(savedSemesters))
      } catch (error) {
        console.error("Error parsing saved semesters:", error)
      }
    }
  }, [toast])

  // Set IDs for scroll targets
  useEffect(() => {
    if (gpaRef.current) {
      gpaRef.current.id = "gpa-section"
    }
    if (cgpaRef.current) {
      cgpaRef.current.id = "cgpa-section"
    }
  }, [])

  // Save data to cookies when it changes
  useEffect(() => {
    setCookie(COOKIE_NAMES.ACTIVE_TAB, activeTab)
  }, [activeTab])

  useEffect(() => {
    setCookie(COOKIE_NAMES.COURSES, JSON.stringify(courses))
  }, [courses])

  useEffect(() => {
    setCookie(COOKIE_NAMES.PREVIOUS_CGPA, previousCGPA.toString())
    setCookie(COOKIE_NAMES.PREVIOUS_CREDITS, previousTotalCredits.toString())
  }, [previousCGPA, previousTotalCredits])

  useEffect(() => {
    setCookie(COOKIE_NAMES.SEMESTERS, JSON.stringify(semesters))
  }, [semesters])

  // Clear GPA data
  const clearGpaData = () => {
    setCourses([{ id: "1", name: "Course 1", creditUnits: 3, gradePoint: 0 }])
    deleteCookie(COOKIE_NAMES.COURSES)
    toast({
      title: "GPA Data Cleared",
      description: "Your GPA calculation data has been cleared.",
    })
  }

  // Clear CGPA data
  const clearCgpaData = () => {
    setPreviousCGPA(0)
    setPreviousTotalCredits(0)
    setSemesters([{ id: "1", gpa: 0, totalCreditUnits: 0 }])
    deleteCookie(COOKIE_NAMES.PREVIOUS_CGPA)
    deleteCookie(COOKIE_NAMES.PREVIOUS_CREDITS)
    deleteCookie(COOKIE_NAMES.SEMESTERS)
    toast({
      title: "CGPA Data Cleared",
      description: "Your CGPA calculation data has been cleared.",
    })
  }

  // Add a new course
  const addCourse = () => {
    setCourses([
      ...courses,
      {
        id: String(Date.now()),
        name: `Course ${courses.length + 1}`,
        creditUnits: 3,
        gradePoint: 0,
        isNew: true, // Mark as new for highlighting
      },
    ])

    // Announce to screen readers
    announceToScreenReader(`Added new course ${courses.length + 1}`)
  }

  // Remove a course
  const removeCourse = (id: string, name: string) => {
    setCourses(courses.filter((course) => course.id !== id))

    // Announce to screen readers
    announceToScreenReader(`Removed course ${name}`)
  }

  // Update course details
  const updateCourse = (id: string, field: keyof Course, value: string | number) => {
    setCourses(
      courses.map((course) => {
        if (course.id === id) {
          const updatedCourse = { ...course, [field]: value }

          // Validate the course
          try {
            if (field === "creditUnits" || field === "gradePoint") {
              const numValue = Number(value)
              courseSchema(maxGrade).shape[field].parse(numValue)

              // Clear error if validation passes
              return {
                ...updatedCourse,
                error: {
                  ...course.error,
                  [field]: undefined,
                },
              }
            }
            return updatedCourse
          } catch (error) {
            if (error instanceof z.ZodError) {
              return {
                ...updatedCourse,
                error: {
                  ...course.error,
                  [field]: error.errors[0].message,
                },
              }
            }
            return updatedCourse
          }
        }
        return course
      }),
    )
  }

  // Add a new semester
  const addSemester = () => {
    setSemesters([
      ...semesters,
      {
        id: String(Date.now()),
        gpa: 0,
        totalCreditUnits: 0,
      },
    ])

    // Announce to screen readers
    announceToScreenReader(`Added new semester ${semesters.length + 1}`)
  }

  // Remove a semester
  const removeSemester = (id: string, index: number) => {
    setSemesters(semesters.filter((semester) => semester.id !== id))

    // Announce to screen readers
    announceToScreenReader(`Removed semester ${index + 1}`)
  }

  // Update semester details
  const updateSemester = (id: string, field: keyof Semester, value: string | number) => {
    setSemesters(
      semesters.map((semester) => {
        if (semester.id === id) {
          const updatedSemester = { ...semester, [field]: Number(value) }

          // Validate the semester
          try {
            semesterSchema.shape[field].parse(Number(value))

            // Clear error if validation passes
            return {
              ...updatedSemester,
              error: {
                ...semester.error,
                [field]: undefined,
              },
            }
          } catch (error) {
            if (error instanceof z.ZodError) {
              return {
                ...updatedSemester,
                error: {
                  ...semester.error,
                  [field]: error.errors[0].message,
                },
              }
            }
            return semester
          }
        }
        return semester
      }),
    )
  }

  // Calculate GPA
  const calculateGPA = () => {
    let totalWeightedPoints = 0
    let totalCreditHours = 0

    courses.forEach((course) => {
      totalWeightedPoints += course.creditUnits * course.gradePoint
      totalCreditHours += course.creditUnits
    })

    if (totalCreditHours === 0) {
      return "0.00"
    }

    const gpa = totalWeightedPoints / totalCreditHours
    return gpa.toFixed(2)
  }

  // Calculate CGPA with the updated formula
  const calculateCGPA = () => {
    // Calculate using the formula: New_CGPA = ((Previous_CGPA * Previous_Credits) + (Current_Semester_GPA * Current_Semester_Credits)) / (Previous_Credits + Current_Semester_Credits)
    const previousWeightedSum = previousCGPA * previousTotalCredits

    // Calculate weighted sum of new semesters
    const newWeightedSum = semesters.reduce((sum, semester) => {
      return sum + semester.gpa * semester.totalCreditUnits
    }, 0)

    // Calculate total credit units
    const totalCreditUnits =
      previousTotalCredits +
      semesters.reduce((sum, semester) => {
        return sum + semester.totalCreditUnits
      }, 0)

    // Calculate CGPA and round to 2 decimal places
    return totalCreditUnits > 0 ? ((previousWeightedSum + newWeightedSum) / totalCreditUnits).toFixed(2) : "0.00"
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // Reset courses when changing grading system
    setCourses([{ id: "1", name: "Course 1", creditUnits: 3, gradePoint: 0 }])

    // Announce to screen readers
    announceToScreenReader(`Switched to ${value === "five-point" ? "5" : "4"}-point scale`)
  }

  // Export GPA data to PDF
  const exportGPAToPDF = () => {
    // Prepare content for preview
    setPdfContent({
      courses,
      gpa: calculateGPA(),
    })

    // Show preview
    setShowGpaPreview(true)

    // Announce to screen readers
    announceToScreenReader("Opened GPA export preview")
  }

  // Export CGPA data to PDF
  const exportCGPAToPDF = () => {
    // Prepare content for preview
    setPdfContent({
      previousCGPA,
      previousTotalCredits,
      semesters,
      cgpa: calculateCGPA(),
    })

    // Show preview
    setShowCgpaPreview(true)

    // Announce to screen readers
    announceToScreenReader("Opened CGPA export preview")
  }

  // Handle actual PDF download for GPA
  const downloadGpaPdf = () => {
    try {
      const doc = new jsPDF()

      // Set document properties
      doc.setProperties({
        title: `Semester GPA Calculator (${maxGrade}-Point Scale)`,
        subject: "GPA Calculation",
        creator: "GPA Calculator",
      })

      // Add BFA watermark
      doc.setTextColor(220, 220, 220) // Light gray for watermark
      doc.setFontSize(80)
      doc.setFont("helvetica", "bold")
      // Calculate center of the page
      const pageWidth = doc.internal.pageSize.width
      const pageHeight = doc.internal.pageSize.height
      // Add rotated text
      doc.text("BFA", pageWidth / 2, pageHeight / 2, {
        align: "center",
        angle: -45,
      })

      // Add title with styling
      doc.setFillColor(240, 240, 240) // Light gray background for header
      doc.rect(0, 0, doc.internal.pageSize.width, 30, "F")
      doc.setFontSize(18)
      doc.setTextColor(0, 0, 0)
      doc.setFont("helvetica", "bold")
      doc.text(`Semester GPA Calculator (${maxGrade}-Point Scale)`, 14, 15)

      // Add date
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25)

      // Add courses table with improved styling - removed Weighted Points column
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Courses:", 14, 40)

      const coursesData = courses.map((course, index) => [
        `Course ${index + 1}`,
        course.name,
        course.creditUnits.toString(),
        course.gradePoint.toString(),
      ])

      // Check if autoTable is available
      if (typeof doc.autoTable !== "function") {
        throw new Error("autoTable function not available. Make sure jspdf-autotable is properly imported.")
      }

      doc.autoTable({
        startY: 45,
        head: [["No.", "Course Name", "Credit Units", "Grade Point"]],
        body: coursesData,
        headStyles: {
          fillColor: [0, 0, 0],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
      })

      // Add GPA result with styled box
      const finalY = (doc as any).lastAutoTable.finalY + 15

      // Add result box with styling
      doc.setFillColor(240, 240, 240) // Light gray background
      doc.roundedRect(14, finalY - 5, 180, 30, 3, 3, "F")

      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Semester GPA:", 20, finalY + 7)

      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text(calculateGPA(), 100, finalY + 7)

      // Add footer
      const pageCount = doc.internal.getNumberOfPages()
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.text(
          "Generated by GPA Calculator - Page " + i + " of " + pageCount,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" },
        )
      }

      // Save the PDF
      doc.save(`Semester_GPA_${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "PDF Generation Failed",
        description: "There was an error creating your PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle actual PDF download for CGPA
  const downloadCgpaPdf = () => {
    try {
      const doc = new jsPDF()

      // Set document properties
      doc.setProperties({
        title: "Cumulative GPA (CGPA) Calculator",
        subject: "CGPA Calculation",
        creator: "GPA Calculator",
      })

      // Add BFA watermark
      doc.setTextColor(220, 220, 220) // Light gray for watermark
      doc.setFontSize(80)
      doc.setFont("helvetica", "bold")
      // Calculate center of the page
      const pageWidth = doc.internal.pageSize.width
      const pageHeight = doc.internal.pageSize.height
      // Add rotated text
      doc.text("BFA", pageWidth / 2, pageHeight / 2, {
        align: "center",
        angle: -45,
      })

      // Add title with styling
      doc.setFillColor(240, 240, 240) // Light gray background for header
      doc.rect(0, 0, doc.internal.pageSize.width, 30, "F")
      doc.setFontSize(18)
      doc.setTextColor(0, 0, 0)
      doc.setFont("helvetica", "bold")
      doc.text("Cumulative GPA (CGPA) Calculator", 14, 15)

      // Add date
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25)

      // Add previous CGPA info in a styled box
      doc.setFillColor(245, 245, 245)
      doc.roundedRect(14, 35, 85, 25, 3, 3, "F")
      doc.roundedRect(105, 35, 85, 25, 3, 3, "F")

      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("Previous CGPA:", 20, 45)
      doc.setFont("helvetica", "normal")
      doc.text(previousCGPA.toString(), 75, 45)

      doc.setFont("helvetica", "bold")
      doc.text("Previous Credits:", 110, 45)
      doc.setFont("helvetica", "normal")
      doc.text(previousTotalCredits.toString(), 170, 45)

      // Add semesters table with improved styling
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Semesters:", 14, 70)

      const semestersData = semesters.map((semester, index) => [
        `Semester ${index + 1}`,
        semester.gpa.toString(),
        semester.totalCreditUnits.toString(),
      ])

      // Check if autoTable is available
      if (typeof doc.autoTable !== "function") {
        throw new Error("autoTable function not available. Make sure jspdf-autotable is properly imported.")
      }

      doc.autoTable({
        startY: 75,
        head: [["Semester", "GPA", "Credit Units"]],
        body: semestersData,
        headStyles: {
          fillColor: [0, 0, 0],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
      })

      // Add CGPA result with styled box
      const finalY = (doc as any).lastAutoTable.finalY + 15

      // Add result box with styling
      doc.setFillColor(240, 240, 240) // Light gray background
      doc.roundedRect(14, finalY - 5, 180, 30, 3, 3, "F")

      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Cumulative GPA (CGPA):", 20, finalY + 7)

      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text(calculateCGPA(), 120, finalY + 7)

      // Add footer
      const pageCount = doc.internal.getNumberOfPages()
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.text(
          "Generated by GPA Calculator - Page " + i + " of " + pageCount,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" },
        )
      }

      // Save the PDF
      doc.save(`CGPA_${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "PDF Generation Failed",
        description: "There was an error creating your PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Helper function to announce messages to screen readers
  const announceToScreenReader = (message: string) => {
    const announcement = document.getElementById("sr-announcement")
    if (announcement) {
      announcement.textContent = message
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Screen reader announcement area */}
        <div id="sr-announcement" aria-live="polite" aria-atomic="true" className="sr-only"></div>

        <div className="text-sm text-muted-foreground mb-2">
          <p>Use the tabs below to select your grading scale. Add your courses and grades to calculate your GPA.</p>
        </div>

        <Tabs id="scale-tabs" defaultValue="five-point" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="five-point">5-Point Scale</TabsTrigger>
            <TabsTrigger value="four-point">4-Point Scale</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === "five-point" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === "five-point" ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* GPA Calculator Section - Same for both tabs but with different max grade */}
              <TabsContent value="five-point" className="space-y-4">
                <motion.div
                  ref={gpaRef}
                  variants={containerVariants}
                  initial="hidden"
                  animate={gpaInView ? "visible" : "hidden"}
                >
                  <GpaSection
                    courses={courses}
                    addCourse={addCourse}
                    removeCourse={removeCourse}
                    updateCourse={updateCourse}
                    calculateGPA={calculateGPA}
                    maxGrade={5}
                    exportGPAToPDF={exportGPAToPDF}
                    clearGpaData={clearGpaData}
                    itemVariants={itemVariants}
                    isExportDisabled={!isGpaValid}
                    setCourses={setCourses}
                  />
                </motion.div>
              </TabsContent>

              <TabsContent value="four-point" className="space-y-4">
                <motion.div
                  ref={gpaRef}
                  variants={containerVariants}
                  initial="hidden"
                  animate={gpaInView ? "visible" : "hidden"}
                >
                  <GpaSection
                    courses={courses}
                    addCourse={addCourse}
                    removeCourse={removeCourse}
                    updateCourse={updateCourse}
                    calculateGPA={calculateGPA}
                    maxGrade={4}
                    exportGPAToPDF={exportGPAToPDF}
                    clearGpaData={clearGpaData}
                    itemVariants={itemVariants}
                    isExportDisabled={!isGpaValid}
                    setCourses={setCourses}
                  />
                </motion.div>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>

        {/* CGPA Calculator Section */}
        <motion.div
          ref={cgpaRef}
          variants={containerVariants}
          initial="hidden"
          animate={cgpaInView ? "visible" : "hidden"}
          className="pt-8"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle>CGPA Calculator</CardTitle>
                <CardDescription>
                  Add your previous CGPA and new semesters to calculate your updated CGPA
                </CardDescription>
                <div className="flex max-w-fit items-center text-sm font-normal bg-primary/10 text-primary px-2 py-1 rounded-full mt-2 semester-badge">
                  <GraduationCap className="h-4 w-4 mr-1" />
                  {semesters.length} {semesters.length === 1 ? "Semester" : "Semesters"}
                </div>
              </div>
              <div className="flex space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div id="clear-button">
                      <Button variant="outline" size="sm" onClick={clearCgpaData} aria-label="Clear CGPA data">
                        <RefreshCw className="h-4 w-4 mr-2" /> Clear
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clear all CGPA calculation data</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div id="export-button">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportCGPAToPDF}
                        disabled={!isCgpaValid}
                        aria-label="Export CGPA to PDF"
                      >
                        <FileDown className="h-4 w-4 mr-2" /> Export
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {!isCgpaValid && (
                    <TooltipContent>
                      <p>Please enter valid CGPA data to enable export</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div id="previous-cgpa-input">
                  <Label htmlFor="previous-cgpa">Previous CGPA ({maxGrade}-Point Scale)</Label>
                  <Input
                    id="previous-cgpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max={maxGrade}
                    value={previousCGPA || ""}
                    onChange={(e) => setPreviousCGPA(Number(e.target.value))}
                    aria-describedby="previous-cgpa-desc"
                  />
                  <p id="previous-cgpa-desc" className="text-xs text-muted-foreground mt-1">
                    Enter your previous cumulative GPA
                  </p>
                </div>
                <div>
                  <Label htmlFor="previous-credits">Previous Total Credit Units</Label>
                  <Input
                    id="previous-credits"
                    type="number"
                    min="0"
                    value={previousTotalCredits || ""}
                    onChange={(e) => setPreviousTotalCredits(Number(e.target.value))}
                    aria-describedby="previous-credits-desc"
                  />
                  <p id="previous-credits-desc" className="text-xs text-muted-foreground mt-1">
                    Enter the total credit units from previous semesters
                  </p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h3 className="text-lg font-medium mb-2">New Semesters</h3>
                <p className="text-sm text-muted-foreground mb-4">Add each semester with its GPA and credit units</p>
              </motion.div>

              <AnimatePresence>
                {semesters.map((semester, index) => (
                  <motion.div
                    key={semester.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-4"
                  >
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      variants={itemVariants}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="md:col-span-5">
                        <Label htmlFor={`semester-${semester.id}-gpa`}>Semester {index + 1} GPA</Label>
                        <Input
                          id={`semester-${semester.id}-gpa`}
                          type="number"
                          step="0.01"
                          min="0"
                          max={maxGrade}
                          value={semester.gpa || ""}
                          onChange={(e) => updateSemester(semester.id, "gpa", e.target.value)}
                          className={semester.error?.gpa ? "border-red-500" : ""}
                          aria-invalid={semester.error?.gpa ? "true" : "false"}
                          aria-describedby={semester.error?.gpa ? `semester-${semester.id}-gpa-error` : undefined}
                        />
                        {semester.error?.gpa && (
                          <p
                            id={`semester-${semester.id}-gpa-error`}
                            className="text-xs text-red-500 mt-1"
                            role="alert"
                          >
                            {semester.error.gpa}
                          </p>
                        )}
                      </div>
                      <div className="md:col-span-5">
                        <Label htmlFor={`semester-${semester.id}-credits`}>Total Credit Units</Label>
                        <Input
                          id={`semester-${semester.id}-credits`}
                          type="number"
                          min="1"
                          value={semester.totalCreditUnits || ""}
                          onChange={(e) => updateSemester(semester.id, "totalCreditUnits", e.target.value)}
                          className={semester.error?.totalCreditUnits ? "border-red-500" : ""}
                          aria-invalid={semester.error?.totalCreditUnits ? "true" : "false"}
                          aria-describedby={
                            semester.error?.totalCreditUnits ? `semester-${semester.id}-credits-error` : undefined
                          }
                        />
                        {semester.error?.totalCreditUnits && (
                          <p
                            id={`semester-${semester.id}-credits-error`}
                            className="text-xs text-red-500 mt-1"
                            role="alert"
                          >
                            {semester.error.totalCreditUnits}
                          </p>
                        )}
                      </div>
                      <div className="md:col-span-2 flex justify-end">
                        {semesters.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSemester(semester.id, index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            aria-label={`Remove semester ${index + 1}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <motion.div variants={itemVariants}>
                <Button
                  id="add-semester-button"
                  onClick={addSemester}
                  variant="outline"
                  className="w-full"
                  aria-label="Add new semester"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Semester
                </Button>
              </motion.div>

              <motion.div
                id="cgpa-result"
                variants={itemVariants}
                className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
              >
                <h3 className="text-lg font-semibold mb-2">Cumulative GPA (CGPA)</h3>
                <p className="text-3xl font-bold" aria-live="polite">
                  {calculateCGPA()}
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* PDF Preview Drawers */}
        <PdfPreview
          open={showGpaPreview}
          onOpenChange={setShowGpaPreview}
          title={`Semester GPA Calculator (${maxGrade}-Point Scale)`}
          content={pdfContent}
          onDownload={downloadGpaPdf}
          type="gpa"
        />

        <PdfPreview
          open={showCgpaPreview}
          onOpenChange={setShowCgpaPreview}
          title="Cumulative GPA (CGPA) Calculator"
          content={pdfContent}
          onDownload={downloadCgpaPdf}
          type="cgpa"
        />
      </div>
    </TooltipProvider>
  )
}

// GPA Section Component
function GpaSection({
  courses,
  addCourse,
  removeCourse,
  updateCourse,
  calculateGPA,
  maxGrade,
  exportGPAToPDF,
  clearGpaData,
  itemVariants,
  isExportDisabled,
  setCourses,
}: {
  courses: Course[]
  addCourse: () => void
  removeCourse: (id: string, name: string) => void
  updateCourse: (id: string, field: keyof Course, value: string | number) => void
  calculateGPA: () => string
  maxGrade: number
  exportGPAToPDF: () => void
  clearGpaData: () => void
  itemVariants: any
  isExportDisabled: boolean
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>
}) {
  // Inside the GpaSection component, add this state:
  const [useAlternativeUploader, setUseAlternativeUploader] = useState(false)

  // Update this function to handle extracted data and properly populate fields
  const handleExtractedData = (
    extractedCourses: Array<{
      name: string
      creditUnits: number
      gradePoint: number
      creditUnitFound?: boolean
      gradeFound?: boolean
    }>,
  ) => {
    // If no courses were extracted, return early
    if (extractedCourses.length === 0) return

    // Clear existing courses first
    clearGpaData()

    // Create a new array of courses with the extracted data
    // Mark all courses as new for highlighting
    const newCourses = extractedCourses.map((course, index) => ({
      id: `extracted-${Date.now()}-${index}`,
      name: course.name || `Course ${index + 1}`,
      creditUnits: course.creditUnits || 3,
      gradePoint: course.gradePoint || 0, // Use extracted grade point or default to 0
      isNew: !course.gradeFound, // Only mark as new if grade wasn't found
    }))

    // Update the courses state directly for immediate UI update
    setCourses(newCourses)

    // Scroll to the course section to make the changes visible
    setTimeout(() => {
      const courseSection = document.getElementById("course-input")
      if (courseSection) {
        courseSection.scrollIntoView({ behavior: "smooth", block: "center" })
      }

      // Highlight the grade dropdowns to prompt user to select grades, but only for courses without grades
      const gradeSelectors = document.querySelectorAll('[id^="course-"][id$="-grade"]')
      gradeSelectors.forEach((selector, index) => {
        if (!extractedCourses[index]?.gradeFound) {
          // Add a pulsing animation to draw attention
          selector.classList.add("ring-2", "ring-primary", "ring-opacity-50", "animate-pulse")

          // Remove the animation after 5 seconds
          setTimeout(() => {
            selector.classList.remove("ring-2", "ring-primary", "ring-opacity-50", "animate-pulse")
          }, 5000)
        }
      })
    }, 500)
  }

  // Common grade options for both scales
  const getGradeOptions = () => {
    if (maxGrade === 5) {
      return [
        { label: "A (5.0)", value: "5" },
        { label: "B (4.0)", value: "4" },
        { label: "C (3.0)", value: "3" },
        { label: "D (2.0)", value: "2" },
        { label: "E (1.0)", value: "1" },
        { label: "F (0.0)", value: "0" },
      ]
    } else {
      return [
        { label: "A (4.0)", value: "4" },
        { label: "B (3.0)", value: "3" },
        { label: "C (2.0)", value: "2" },
        { label: "D (1.0)", value: "1" },
        { label: "F (0.0)", value: "0" },
      ]
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between flex-wrap gap-4">
        <div>
          <CardTitle>Semester GPA Calculator ({maxGrade}-Point Scale)</CardTitle>
          <CardDescription>Add your courses and grades to calculate your semester GPA</CardDescription>
          <div className="flex max-w-fit items-center text-sm font-normal bg-primary/10 text-primary px-2 py-1 rounded-full mt-2 course-badge">
            <BookOpen className="h-4 w-4 mr-1" />
            {courses.length} {courses.length === 1 ? "Course" : "Courses"}
          </div>
        </div>
        <div className="flex space-x-2 mt-2 sm:mt-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <div id="clear-button">
                <Button variant="outline" size="sm" onClick={clearGpaData} aria-label="Clear GPA data">
                  <RefreshCw className="h-4 w-4 mr-2" /> Clear
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clear all GPA calculation data</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div id="export-button">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportGPAToPDF}
                  disabled={isExportDisabled}
                  aria-label="Export GPA to PDF"
                >
                  <FileDown className="h-4 w-4 mr-2" /> Export
                </Button>
              </div>
            </TooltipTrigger>
            {isExportDisabled && (
              <TooltipContent>
                <p>Please add at least one course with valid data to enable export</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          <p>Enter your course details below or upload a transcript to automatically extract course data.</p>
        </div>

        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="border rounded-lg p-4 bg-background/50 upload-transcript-section"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium">Upload Transcript</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUseAlternativeUploader(!useAlternativeUploader)}
              className="text-xs"
            >
              {useAlternativeUploader ? "Try Full Uploader" : "Use PDF-Only Mode"}
            </Button>
          </div>

          {useAlternativeUploader ? (
            <FileUploadPdfOnly onExtractedData={handleExtractedData} maxGrade={maxGrade} />
          ) : (
            <FileUpload onExtractedData={handleExtractedData} maxGrade={maxGrade} />
          )}

          <p className="text-xs text-lime-500 mt-2">Extraction is not always accurate so crosscheck the details.</p>
          <p className="text-xs text-muted-foreground mt-2">
            Note: After extraction, you'll need to select appropriate grades for each course.
            {!useAlternativeUploader && (
              <span className="block mt-1">If you encounter errors, try switching to PDF-Only Mode.</span>
            )}
          </p>
        </motion.div>

        <AnimatePresence>
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4"
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                variants={itemVariants}
                className={`grid grid-cols-1 md:grid-cols-12 gap-4 items-end border-b pb-4 last:border-0 last:pb-0 ${
                  course.isNew ? "bg-primary/5 p-3 rounded-md border border-primary/20" : ""
                }`}
                id={index === 0 ? "course-input" : undefined}
              >
                <div className="md:col-span-4">
                  <Label htmlFor={`course-${course.id}-name`}>Course Name</Label>
                  <Input
                    id={`course-${course.id}-name`}
                    value={course.name}
                    onChange={(e) => updateCourse(course.id, "name", e.target.value)}
                    placeholder="Course Name"
                    aria-label={`Name for course ${index + 1}`}
                    className={course.isNew ? "border-primary/30 focus:border-primary" : ""}
                  />
                </div>
                <div className="md:col-span-3">
                  <Label htmlFor={`course-${course.id}-credits`}>Credit Units</Label>
                  <Input
                    id={`course-${course.id}-credits`}
                    type="number"
                    min="1"
                    value={course.creditUnits || ""}
                    onChange={(e) => updateCourse(course.id, "creditUnits", Number(e.target.value))}
                    className={`${course.error?.creditUnits ? "border-red-500" : ""} ${
                      course.isNew ? "border-primary/30 focus:border-primary" : ""
                    }`}
                    aria-invalid={course.error?.creditUnits ? "true" : "false"}
                    aria-describedby={course.error?.creditUnits ? `course-${course.id}-credits-error` : undefined}
                  />
                  {course.error?.creditUnits && (
                    <p id={`course-${course.id}-credits-error`} className="text-xs text-red-500 mt-1" role="alert">
                      {course.error.creditUnits}
                    </p>
                  )}
                </div>
                <div className="md:col-span-3">
                  <Label htmlFor={`course-${course.id}-grade`}>Grade</Label>
                  <Select
                    value={String(course.gradePoint)}
                    onValueChange={(value) => {
                      updateCourse(course.id, "gradePoint", Number(value))
                      // Remove the isNew flag once the user selects a grade
                      if (course.isNew) {
                        setCourses((prevCourses) =>
                          prevCourses.map((c) => (c.id === course.id ? { ...c, isNew: false } : c)),
                        )
                      }
                    }}
                  >
                    <SelectTrigger
                      id={`course-${course.id}-grade`}
                      className={`${course.error?.gradePoint ? "border-red-500" : ""} ${
                        course.isNew ? "border-primary/30 focus:border-primary animate-pulse" : ""
                      }`}
                      aria-invalid={course.error?.gradePoint ? "true" : "false"}
                      aria-describedby={course.error?.gradePoint ? `course-${course.id}-grade-error` : undefined}
                    >
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {getGradeOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {course.error?.gradePoint && (
                    <p id={`course-${course.id}-grade-error`} className="text-xs text-red-500 mt-1" role="alert">
                      {course.error.gradePoint}
                    </p>
                  )}
                  {course.isNew && course.gradePoint === 0 && (
                    <p className="text-xs text-primary mt-1">Please select a grade for this course</p>
                  )}
                </div>
                <div className="md:col-span-2 flex justify-end">
                  {courses.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCourse(course.id, course.name)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      aria-label={`Remove course ${course.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.div variants={itemVariants}>
          <Button
            id="add-course-button"
            onClick={addCourse}
            variant="outline"
            className="w-full"
            aria-label="Add new course"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Course
          </Button>
        </motion.div>

        <motion.div
          id="gpa-result"
          variants={itemVariants}
          className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
        >
          <h3 className="text-lg font-semibold mb-2">Semester GPA</h3>
          <p className="text-3xl font-bold" aria-live="polite">
            {calculateGPA()}
          </p>
        </motion.div>
      </CardContent>
    </Card>
  )
}
