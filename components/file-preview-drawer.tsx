"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ZoomIn, ZoomOut, RotateCw } from "lucide-react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"

interface FilePreviewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: File | null
}

export function FilePreviewDrawer({ open, onOpenChange, file }: FilePreviewDrawerProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [isPdf, setIsPdf] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (file && open) {
      setLoading(true)
      // Create a URL for the file
      const url = URL.createObjectURL(file)
      setFileUrl(url)
      setIsPdf(file.type === "application/pdf")

      // Reset zoom and rotation when opening a new file
      setZoomLevel(1)
      setRotation(0)

      // Cleanup function to revoke the URL when component unmounts
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [file, open])

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleImageLoad = () => {
    setLoading(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] dark:bg-gray-900 dark:text-white dark:border-t dark:border-gray-800">
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        >
          <DrawerHeader>
            <DrawerTitle>File Preview</DrawerTitle>
            <DrawerDescription className="dark:text-gray-400">{file?.name || "No file selected"}</DrawerDescription>
          </DrawerHeader>

          <div className="overflow-y-auto px-4 max-h-[60vh] flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="relative"
            >
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {fileUrl && isPdf ? (
                <iframe
                  src={`${fileUrl}#toolbar=0&navpanes=0`}
                  className="w-full h-[60vh] border rounded-lg"
                  onLoad={handleImageLoad}
                />
              ) : fileUrl ? (
                <div className="overflow-hidden rounded-lg border border-border">
                  <img
                    src={fileUrl || "/placeholder.svg"}
                    alt="File preview"
                    className="max-w-full h-auto object-contain"
                    style={{
                      transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                      transformOrigin: "center",
                      transition: "transform 0.3s ease",
                    }}
                    onLoad={handleImageLoad}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[60vh] border rounded-lg border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-muted-foreground">No preview available</p>
                </div>
              )}
            </motion.div>
          </div>

          <DrawerFooter className="pt-2">
            <div className="flex justify-center space-x-2 mb-4">
              <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={isPdf}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleZoomIn} disabled={isPdf}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleRotate} disabled={isPdf}>
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
            <DrawerClose asChild>
              <Button variant="outline" className="dark:border-gray-700 dark:hover:bg-gray-800">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </motion.div>
      </DrawerContent>
    </Drawer>
  )
}
