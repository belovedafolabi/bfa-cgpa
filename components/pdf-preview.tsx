"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useToast } from "@/components/toast-provider"

interface PdfPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  content: any
  onDownload: () => void
  type: "gpa" | "cgpa"
}

export function PdfPreview({ open, onOpenChange, title, content, onDownload, type }: PdfPreviewProps) {
  const { toast } = useToast()
  const [previewContent, setPreviewContent] = useState<React.ReactNode | null>(null)

  useEffect(() => {
    if (open) {
      // Generate preview content based on type
      if (type === "gpa") {
        setPreviewContent(
          <div className="space-y-4 p-4">
            <h2 className="text-xl font-bold">{title}</h2>
            <div className="border rounded-md p-4 dark:border-gray-700">
              <h3 className="font-medium mb-2">Courses</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left p-2">Course</th>
                    <th className="text-left p-2">Credit Units</th>
                    <th className="text-left p-2">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {content.courses.map((course, index) => (
                    <tr key={index} className="border-b dark:border-gray-700">
                      <td className="p-2">{course.name}</td>
                      <td className="p-2">{course.creditUnits}</td>
                      <td className="p-2">{course.gradePoint}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <h3 className="font-medium mb-2">Semester GPA</h3>
              <p className="text-2xl font-bold">{content.gpa}</p>
            </div>
            <div className="relative w-full h-40 opacity-10 flex items-center justify-center overflow-hidden">
              <div className="absolute transform rotate-[-45deg] text-6xl font-bold text-gray-400">BFA</div>
            </div>
          </div>,
        )
      } else {
        setPreviewContent(
          <div className="space-y-4 p-4">
            <h2 className="text-xl font-bold">{title}</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="border rounded-md p-4 dark:border-gray-700">
                <h3 className="font-medium mb-2">Previous CGPA</h3>
                <p className="text-xl">{content.previousCGPA}</p>
              </div>
              <div className="border rounded-md p-4 dark:border-gray-700">
                <h3 className="font-medium mb-2">Previous Credits</h3>
                <p className="text-xl">{content.previousTotalCredits}</p>
              </div>
            </div>
            <div className="border rounded-md p-4 dark:border-gray-700">
              <h3 className="font-medium mb-2">Semesters</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left p-2">Semester</th>
                    <th className="text-left p-2">GPA</th>
                    <th className="text-left p-2">Credit Units</th>
                  </tr>
                </thead>
                <tbody>
                  {content.semesters.map((semester, index) => (
                    <tr key={index} className="border-b dark:border-gray-700">
                      <td className="p-2">Semester {index + 1}</td>
                      <td className="p-2">{semester.gpa}</td>
                      <td className="p-2">{semester.totalCreditUnits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <h3 className="font-medium mb-2">Cumulative GPA (CGPA)</h3>
              <p className="text-2xl font-bold">{content.cgpa}</p>
            </div>
            <div className="relative w-full h-40 opacity-10 flex items-center justify-center overflow-hidden">
              <div className="absolute transform rotate-[-45deg] text-6xl font-bold text-gray-400">BFA</div>
            </div>
          </div>,
        )
      }
    }
  }, [open, content, title, type])

  // Update the handleDownload function to include error handling
  const handleDownload = () => {
    toast({
      title: "Download started",
      description: "Preparing your PDF file...",
    })

    // Simulate download process with error handling
    setTimeout(() => {
      try {
        onDownload()
        toast({
          title: "Download complete",
          description: "Your PDF has been downloaded successfully!",
        })
        onOpenChange(false)
      } catch (error) {
        console.error("Download error:", error)
        toast({
          title: "Download failed",
          description: "There was an error generating your PDF. Please try again.",
          variant: "destructive",
        })
      }
    }, 1500)
  }

  return (
    <AnimatePresence>
      {open && (
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent className="max-h-[85vh] dark:bg-gray-900 dark:text-white dark:border-t dark:border-gray-800">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            >
              <DrawerHeader>
                <DrawerTitle>{title}</DrawerTitle>
                <DrawerDescription className="dark:text-gray-400">Preview before downloading</DrawerDescription>
              </DrawerHeader>
              <div className="overflow-y-auto px-4 max-h-[60vh]">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  {previewContent}
                </motion.div>
              </div>
              <DrawerFooter className="pt-2">
                <Button onClick={handleDownload} className="w-full">
                  <FileDown className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline" className="dark:border-gray-700 dark:hover:bg-gray-800 w-full">
                    Close
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </motion.div>
          </DrawerContent>
        </Drawer>
      )}
    </AnimatePresence>
  )
}
