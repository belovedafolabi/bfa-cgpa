"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Upload, FileText, X, AlertCircle, Check, Eye } from "lucide-react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/toast-provider"
import { extractCourseData } from "@/utils/course-extractor"
import { FilePreviewDrawer } from "@/components/file-preview-drawer"
import { convertGradeToPoints } from "@/utils/grade-converter"

// Define the file schema using Zod - PDF only
const fileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "File size must be less than 5MB",
    })
    .refine((file) => file.type === "application/pdf", {
      message: "Only PDF files are allowed",
    }),
})

type FileUploadPdfOnlyProps = {
  onExtractedData: (
    courses: Array<{
      name: string
      creditUnits: number
      gradePoint: number
      creditUnitFound?: boolean
      gradeFound?: boolean
    }>,
  ) => void
  maxGrade: number
}

export function FileUploadPdfOnly({ onExtractedData, maxGrade }: FileUploadPdfOnlyProps) {
  const { toast } = useToast()
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const validateAndSetFile = (file: File) => {
    try {
      fileSchema.parse({ file })
      setFile(file)
      setError(null)
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message)
        toast({
          title: "Invalid File",
          description: error.errors[0].message,
          variant: "destructive",
        })
      }
    }
  }

  const clearFile = () => {
    setFile(null)
    setError(null)
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const processFile = async () => {
    if (!file) return

    setIsProcessing(true)
    setProgress(10)

    try {
      await processPdf(file)
    } catch (err) {
      console.error("Processing error:", err)
      setError("Failed to process file. Please try again.")
      toast({
        title: "Processing Failed",
        description: "Could not extract data from the file. Please try again or use a different file.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setProgress(100)

      // Reset progress after a delay
      setTimeout(() => {
        setProgress(0)
      }, 1000)
    }
  }

  const processPdf = async (file: File) => {
    try {
      // Import PDF.js dynamically
      const pdfjsLib = await import("pdfjs-dist")

      // Set the worker source
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`

      setProgress(30)

      // Load the PDF document
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

      setProgress(40)

      // Performance improvement: Process only the first 3 pages
      const maxPages = Math.min(pdf.numPages, 3)
      let allText = ""

      // Extract text from multiple pages for better results
      for (let i = 1; i <= maxPages; i++) {
        setProgress(40 + Math.floor((i / maxPages) * 30)) // Progress from 40% to 70%
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map((item: any) => item.str).join(" ")
        allText += pageText + " "
      }

      setProgress(70)

      // Extract course data
      // For PDF-only mode, we still want to extract grades if possible, but fall back to manual selection
      const courses = extractGradesFromText(allText, maxGrade)

      setProgress(90)

      if (courses.length > 0) {
        onExtractedData(courses)
        toast({
          title: "Data Extracted",
          description: `Successfully extracted ${courses.length} courses. Please select appropriate grades.`,
        })
      } else {
        toast({
          title: "No Data Found",
          description: "Could not find course data in the PDF. Please check the format and try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("PDF processing error:", error)
      throw new Error("Failed to process PDF file")
    }
  }

  // Helper function to extract grades from text that might contain numeric scores with letter grades
  const extractGradesFromText = (text: string, maxGrade: number) => {
    // First try to extract using the utility function
    const courses = extractCourseData(text, maxGrade, false)

    // If we found courses with grades, return them
    if (courses.some((course) => course.gradePoint > 0)) {
      return courses
    }

    // Otherwise, try a more aggressive approach for formats like "75A", "68B", etc.
    const lines = text.split("\n")
    const enhancedCourses = []

    for (const course of courses) {
      // Try to find the course code in the text
      const courseLines = lines.filter((line) => line.includes(course.name))
      let gradePoint = 0
      let gradeFound = false

      for (const line of courseLines) {
        // Look for patterns like "75A", "68B", etc.
        const gradeMatch = line.match(/\b\d+\s*([ABCDEF][+-]?)\b/i)
        if (gradeMatch && gradeMatch[1]) {
          const letterGrade = gradeMatch[1].toUpperCase()
          gradePoint = convertGradeToPoints(letterGrade, maxGrade)
          gradeFound = true
          break
        }
      }

      // Look for credit units in the course lines
      let creditUnits = course.creditUnits
      let creditUnitFound = course.creditUnitFound || false

      if (!creditUnitFound) {
        for (const line of courseLines) {
          // Look for credit unit patterns - enhanced with more patterns
          const unitPatterns = [
            /(\d{1,2})\s*(?:unit|units|credit|credits|cu|cr|hour|hours)/i,
            /(?:unit|units|credit|credits|cu|cr|hour|hours)\s*(?:=|:)?\s*(\d{1,2})/i,
            /$$(\d{1,2})\s*(?:unit|units|credit|credits|cu|cr|hour|hours)?$$/i,
            /\bcourse\s+(?:unit|credit)s?\s*(?:=|:)?\s*(\d{1,2})\b/i,
            /\b(\d{1})\s*(?:cr|cu)\b/i,
            // Look for standalone numbers that are likely credit units
            /\b(\d{1})\b(?!\s*(?:st|nd|rd|th|\d|%|\.|,\d))/i,
          ]

          for (const pattern of unitPatterns) {
            const unitMatch = line.match(pattern)
            if (unitMatch && unitMatch[1]) {
              const units = Number.parseInt(unitMatch[1], 10)
              if (units >= 1 && units <= 12) {
                // Validate reasonable unit values
                creditUnits = units
                creditUnitFound = true
                break
              }
            }
          }

          if (creditUnitFound) break
        }
      }

      enhancedCourses.push({
        ...course,
        creditUnits,
        gradePoint: gradePoint > 0 ? gradePoint : course.gradePoint,
        gradeFound: gradeFound || course.gradeFound,
        creditUnitFound,
      })
    }

    return enhancedCourses
  }

  const openPreview = () => {
    setShowPreview(true)
  }

  return (
    <div className="w-full space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? "border-primary bg-primary/10"
            : error
              ? "border-destructive bg-destructive/10"
              : "border-border hover:border-primary/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf"
          className="hidden"
          aria-label="Upload PDF"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          {!file ? (
            <>
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Upload className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Drag & drop or click to upload</p>
                <p className="text-xs text-muted-foreground">PDF files only (max 5MB)</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                Select File
              </Button>
            </>
          ) : (
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={clearFile} className="h-8 w-8 p-0" aria-label="Remove file">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {isProcessing ? (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-center text-muted-foreground">Processing file... {progress}%</p>
                </div>
              ) : (
                <div className="flex justify-center space-x-2">
                  <Button size="sm" onClick={processFile} className="mt-2" disabled={isProcessing}>
                    Extract Course Data
                  </Button>
                  <Button size="sm" variant="outline" onClick={openPreview} className="mt-2" disabled={isProcessing}>
                    <Eye className="h-4 w-4 mr-1" /> Preview
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {progress === 100 && !error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-green-600 dark:text-green-500 text-sm"
        >
          <Check className="h-4 w-4" />
          <span>Processing complete!</span>
        </motion.div>
      )}

      {/* File Preview Drawer */}
      <FilePreviewDrawer open={showPreview} onOpenChange={setShowPreview} file={file} />
    </div>
  )
}
