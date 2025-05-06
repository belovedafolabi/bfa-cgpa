"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Upload, FileText, X, AlertCircle, Check } from "lucide-react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/toast-provider"

// Define the file schema using Zod
const fileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "File size must be less than 5MB",
    })
    .refine(
      (file) => {
        const fileType = file.type
        return fileType === "application/pdf" // Only allow PDFs for now
      },
      {
        message: "Only PDF files are allowed",
      },
    ),
})

type FileUploadProps = {
  onExtractedData: (courses: Array<{ name: string; creditUnits: number; gradePoint: number }>) => void
  maxGrade: number
}

export function FileUploadAlternative({ onExtractedData, maxGrade }: FileUploadProps) {
  const { toast } = useToast()
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
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
      // Process PDF
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

      setProgress(50)

      // Extract text from the first page
      const page = await pdf.getPage(1)
      const textContent = await page.getTextContent()
      const text = textContent.items.map((item: any) => item.str).join(" ")

      setProgress(70)

      // Extract course data
      const courses = extractCourseData(text)

      setProgress(90)

      if (courses.length > 0) {
        onExtractedData(courses)
        toast({
          title: "Data Extracted",
          description: `Successfully extracted ${courses.length} courses from the PDF.`,
        })
      } else {
        // Generate some example courses as a fallback
        const exampleCourses = generateExampleCourses()
        onExtractedData(exampleCourses)

        toast({
          title: "Limited Data Found",
          description: "We've added some example courses. Please edit them with your actual course information.",
        })
      }
    } catch (error) {
      console.error("PDF processing error:", error)
      throw new Error("Failed to process PDF file")
    }
  }

  // Function to extract course data from text
  const extractCourseData = (text: string) => {
    const courses: Array<{ name: string; creditUnits: number; gradePoint: number }> = []

    // Common course code patterns (e.g., ABC123, COMP101, etc.)
    const courseCodePattern = /[A-Z]{2,4}\s?\d{3,4}/g
    const possibleCourses = text.match(courseCodePattern) || []

    // Process each potential course
    possibleCourses.forEach((courseCode) => {
      // Find the course in the text
      const courseIndex = text.indexOf(courseCode)
      if (courseIndex === -1) return

      // Extract a chunk of text around the course code
      const chunkSize = 100
      const startIndex = Math.max(0, courseIndex - 20)
      const endIndex = Math.min(text.length, courseIndex + chunkSize)
      const chunk = text.substring(startIndex, endIndex)

      // Try to extract course name (usually follows the course code)
      let courseName = courseCode
      const nameMatch = chunk.match(new RegExp(`${courseCode}\\s+([\\w\\s\\-&]+)`, "i"))
      if (nameMatch && nameMatch[1]) {
        courseName = `${courseCode} ${nameMatch[1].trim()}`
      }

      // Try to extract credit units (look for numbers followed by "unit" or "credit")
      let creditUnits = 3 // Default
      const creditMatch = chunk.match(/(\d+)\s*(?:unit|credit|cr)/i)
      if (creditMatch && creditMatch[1]) {
        creditUnits = Number.parseInt(creditMatch[1], 10)
      }

      // Try to extract grade (A, B, C, D, F)
      let gradePoint = 0

      // Skip if the text contains course status indicators that might be confused with grades
      if (!chunk.match(/$$C$$|$$R$$|$$E$$/)) {
        // Look for grade patterns
        const gradeMatch = chunk.match(/\b([ABCDF][+-]?)\b/i)
        if (gradeMatch && gradeMatch[1]) {
          const grade = gradeMatch[1].toUpperCase()

          // Convert letter grade to grade point based on scale
          if (maxGrade === 5) {
            // 5-point scale
            switch (grade) {
              case "A":
                gradePoint = 5
                break
              case "B":
                gradePoint = 4
                break
              case "C":
                gradePoint = 3
                break
              case "D":
                gradePoint = 2
                break
              case "E":
                gradePoint = 1
                break
              case "F":
                gradePoint = 0
                break
              default:
                gradePoint = 0
            }
          } else {
            // 4-point scale
            switch (grade) {
              case "A":
                gradePoint = 4
                break
              case "B":
                gradePoint = 3
                break
              case "C":
                gradePoint = 2
                break
              case "D":
                gradePoint = 1
                break
              case "F":
                gradePoint = 0
                break
              default:
                gradePoint = 0
            }
          }
        }
      }

      // Add the course if we have valid data
      if (courseName && creditUnits > 0) {
        courses.push({
          name: courseName.substring(0, 50), // Limit name length
          creditUnits,
          gradePoint,
        })
      }
    })

    return courses
  }

  // Fallback function to generate example courses
  const generateExampleCourses = () => {
    const examples = [
      { name: "MATH 101 Introduction to Calculus", creditUnits: 3, gradePoint: maxGrade },
      { name: "COMP 202 Programming Fundamentals", creditUnits: 4, gradePoint: maxGrade - 1 },
      { name: "PHYS 105 Physics I", creditUnits: 3, gradePoint: maxGrade - 1 },
      { name: "ENGL 211 Academic Writing", creditUnits: 3, gradePoint: maxGrade },
    ]
    return examples
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
                <div className="flex justify-center">
                  <Button size="sm" onClick={processFile} className="mt-2" disabled={isProcessing}>
                    Extract Course Data
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
    </div>
  )
}
