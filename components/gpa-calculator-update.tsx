import type React from "react"
import { toast } from "@/components/ui/use-toast"

// Define the Course type
interface Course {
  id: string
  name: string
  creditUnits: number
  gradePoint: number
}

// Mock announceToScreenReader function (replace with actual implementation)
const announceToScreenReader = (message: string) => {
  console.log(`Announcement: ${message}`)
}

// Add this to the GpaCalculator component, replacing the existing addCourse function

// Add a new course
const addCourse = (courses: Course[], setCourses: React.Dispatch<React.SetStateAction<Course[]>>) => {
  const newCourse = {
    id: String(Date.now()),
    name: `Course ${courses.length + 1}`,
    creditUnits: 3,
    gradePoint: 0,
  }

  setCourses([...courses, newCourse])

  // Announce to screen readers
  announceToScreenReader(`Added new course ${courses.length + 1}`)

  return newCourse.id // Return the ID of the new course
}

// Update the handleExtractedData function in the GpaSection component
const handleExtractedData = (
  extractedCourses: Array<{ name: string; creditUnits: number; gradePoint: number }>,
  courses: Course[],
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>,
  clearGpaData: () => void,
  updateCourse: (id: string, field: string, value: string | number) => void,
) => {
  if (!extractedCourses || extractedCourses.length === 0) {
    toast({
      title: "No Data Found",
      description: "Could not extract course data from the file. Please try again with a different file.",
      variant: "destructive",
    })
    return
  }

  // Store original courses to restore if needed
  const originalCourses = [...courses]

  try {
    // Clear existing courses first
    clearGpaData()

    // Update the first course with the first extracted course data
    setTimeout(() => {
      if (courses.length > 0) {
        updateCourse(courses[0].id, "name", extractedCourses[0].name)
        updateCourse(courses[0].id, "creditUnits", extractedCourses[0].creditUnits)
        updateCourse(courses[0].id, "gradePoint", extractedCourses[0].gradePoint)
      }

      // Add the rest of the courses with animation delay
      extractedCourses.slice(1).forEach((course, index) => {
        setTimeout(() => {
          // Add a new course
          addCourse(courses, setCourses)

          // Get the newly added course (it will be the last one in the array)
          const newCourseId = courses[courses.length - 1].id

          // Update the new course with extracted data
          setTimeout(() => {
            updateCourse(newCourseId, "name", course.name)
            updateCourse(newCourseId, "creditUnits", course.creditUnits)
            updateCourse(newCourseId, "gradePoint", course.gradePoint)
          }, 100)
        }, index * 500) // 500ms delay between each course
      })
    }, 100)

    toast({
      title: "Courses Added",
      description: `Successfully added ${extractedCourses.length} courses from your file.`,
    })
  } catch (error) {
    console.error("Error adding extracted courses:", error)
    // Restore original courses if there was an error
    setCourses(originalCourses)
    toast({
      title: "Error Adding Courses",
      description: "There was a problem adding the extracted courses. Please try again.",
      variant: "destructive",
    })
  }
}
