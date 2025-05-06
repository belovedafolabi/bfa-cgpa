// Utility functions for extracting course data from text

type ExtractedCourse = {
  name: string
  creditUnits: number
  gradePoint: number
  creditUnitFound?: boolean // Track if we found credit units
  gradeFound?: boolean // Track if we found a grade
}

/**
 * Extracts course data from text content
 * @param text The text to extract course data from
 * @param maxGrade The maximum grade point (4 or 5)
 * @param ignoreGrades Whether to ignore grades and set default to 0
 */
export function extractCourseData(text: string, maxGrade: number, ignoreGrades = false): ExtractedCourse[] {
  // Normalize text to improve matching
  const normalizedText = text
    .replace(/\s+/g, " ") // Replace multiple spaces with a single space
    .replace(/[^\w\s.,():;-]/g, "") // Remove special characters except those in the allowed list
    .trim()
    .toUpperCase() // Convert to uppercase for better matching

  // Store extracted courses to avoid duplicates
  const extractedCourses: ExtractedCourse[] = []
  const extractedCourseCodes = new Set<string>()

  // Look for course code patterns - more specific to match common formats
  // This matches patterns like: ABC 123, ABC123, ABC-123, etc.
  const courseCodePattern = /\b([A-Z]{2,4})\s?[-]?\s?(\d{3,4}[A-Z]?)\b/g

  let match: RegExpExecArray | null
  while ((match = courseCodePattern.exec(normalizedText)) !== null) {
    const fullMatch = match[0]
    // Format the course code consistently as "ABC 123"
    const courseCode = `${match[1]} ${match[2]}`.replace(/\s+/g, " ").trim()

    // Skip if we've already extracted this course code
    if (extractedCourseCodes.has(courseCode)) {
      continue
    }

    // Find the context around this course code - expanded context for better extraction
    const contextStart = Math.max(0, match.index - 150)
    const contextEnd = Math.min(normalizedText.length, match.index + 250)
    const context = normalizedText.substring(contextStart, contextEnd)

    // Extract credit units - look for numbers near unit-related terms
    let creditUnits = 3 // Default
    let creditUnitFound = false

    // Enhanced credit unit extraction - look for various labels and standalone values
    const creditUnitPatterns = [
      // Look for specific patterns near the course code with various labels
      new RegExp(`${courseCode}.*?(\\d{1,2})\\s*(?:UNIT|UNITS|CREDIT|CREDITS|CU|CR|HOUR|HOURS)\\b`, "i"),
      new RegExp(`${courseCode}.*?(?:UNIT|UNITS|CREDIT|CREDITS|CU|CR|HOUR|HOURS)\\s*(?:=|:)?\\s*(\\d{1,2})\\b`, "i"),

      // Look for "Course Unit" or similar labels
      new RegExp(
        `${courseCode}.*?(?:COURSE\\s+UNIT|CREDIT\\s+UNIT|CREDIT\\s+HOUR)S?\\s*(?:=|:)?\\s*(\\d{1,2})\\b`,
        "i",
      ),

      // Look for unit patterns in the general context
      new RegExp(`${courseCode}.*?\$$\\s*(\\d{1,2})\\s*(?:UNIT|UNITS|CREDIT|CREDITS|CU|CR|HOUR|HOURS)?\\s*\$$`, "i"),

      // Look for unit patterns with equals sign or colon
      new RegExp(`${courseCode}.*?\\b(?:UNIT|UNITS|CREDIT|CREDITS|CU|CR|HOUR|HOURS)\\s*(?:=|:)\\s*(\\d{1,2})\\b`, "i"),

      // Look for unit patterns with parentheses
      /$$(\d{1,2})\s*(?:UNIT|UNITS|CREDIT|CREDITS|CU|CR|HOUR|HOURS)?$$/i,

      // Look for standalone numbers that are likely credit units (near the course code)
      new RegExp(`${courseCode}.*?\\b(\\d{1})\\b(?!\\s*(?:ST|ND|RD|TH|\\d))`, "i"),
      new RegExp(`${courseCode}.*?\\b(\\d{1})\\s*(?:CR|CU)\\b`, "i"),

      // General patterns
      /\b(\d{1,2})\s*(?:UNIT|UNITS|CREDIT|CREDITS|CU|CR|HOUR|HOURS)\b/i,
      /\b(?:UNIT|UNITS|CREDIT|CREDITS|CU|CR|HOUR|HOURS)\s*(?:=|:)?\s*(\d{1,2})\b/i,

      // Look for common credit unit values in a context that suggests they are credit units
      /\bCOURSE\s+(?:INFO|INFORMATION|DETAILS).*?\b(\d{1,2})\b(?!%|\/)/i,
      /\b(?:CREDIT|UNIT)\s+VALUE.*?(\d{1,2})\b/i,
    ]

    for (const pattern of creditUnitPatterns) {
      const unitMatch = context.match(pattern)
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

    // If we still haven't found credit units, look for standalone numbers that are likely to be credit units
    if (!creditUnitFound) {
      // Look for standalone numbers 1-6 (common credit unit values) near the course code
      const standaloneMatch = context.match(
        new RegExp(`${courseCode}.*?\\s+\\b([1-6])\\b(?!\\s*(?:ST|ND|RD|TH|\\d|%|\\.|,\\d))`, "i"),
      )
      if (standaloneMatch && standaloneMatch[1]) {
        const units = Number.parseInt(standaloneMatch[1], 10)
        if (units >= 1 && units <= 6) {
          // Most credit units are between 1 and 6
          creditUnits = units
          creditUnitFound = true
        }
      }
    }

    // Try to extract grade (A, B, C, D, F)
    let gradePoint = 0
    let gradeFound = false

    // Only try to extract grade if not ignoring grades
    if (!ignoreGrades) {
      // Enhanced grade extraction - look for various labels and formats
      const gradePatterns = [
        // Look for grade labels followed by letter grades
        new RegExp(
          `${courseCode}.*?(?:GRADE|COURSE\\s+GRADE|GRADE\\s+VALUE|MARK|SCORE)\\s*(?:=|:)?\\s*([ABCDEF][+-]?)\\b`,
          "i",
        ),
        // Look for grade point values
        new RegExp(`${courseCode}.*?(?:GRADE\\s+POINT|GP|GPA)\\s*(?:=|:)?\\s*(\\d\\.?\\d*)\\b`, "i"),
        // Look for letter grades near the course code
        new RegExp(`${courseCode}.*?\\b([ABCDEF][+-]?)\\b`, "i"),
        // Look for numeric grades followed by letter grades (e.g., 75A, 68B)
        new RegExp(`${courseCode}.*?\\b\\d+\\s*([ABCDEF][+-]?)\\b`, "i"),
        // General grade patterns in the context
        /\b(?:GRADE|COURSE\s+GRADE|GRADE\s+VALUE|MARK|SCORE)\s*(?:=|:)?\s*([ABCDEF][+-]?)\\b/i,
        // Look for grade point values
        /\b(?:GRADE\s+POINT|GP|GPA)\s*(?:=|:)?\s*(\\d\.?\\d*)\\b/i,
        // Look for numeric grades followed by letter grades in the general context
        /\b\d+\s*([ABCDEF][+-]?)\b/i,
        // Look for standalone letter grades (more prone to false positives)
        /\b([ABCDEF][+-]?)\\b/i,
      ]

      for (const pattern of gradePatterns) {
        const gradeMatch = context.match(pattern)
        if (gradeMatch && gradeMatch[1]) {
          // Skip if the text contains course status indicators that might be confused with grades
          if (!context.match(/\b(IP|W|I|AU|TR|CR|NC)\b/i)) {
            const gradeValue = gradeMatch[1].toUpperCase()

            // Check if it's a numeric grade point or letter grade
            if (/^\d\.?\d*$/.test(gradeValue)) {
              // It's a numeric grade point
              const numericGrade = Number.parseFloat(gradeValue)
              if (numericGrade >= 0 && numericGrade <= maxGrade) {
                gradePoint = numericGrade
                gradeFound = true
                break
              }
            } else {
              // It's a letter grade
              gradePoint = convertGradeToPoints(gradeValue, maxGrade)
              gradeFound = true
              break
            }
          }
        }
      }
    }

    // Add the course to our results with ONLY the course code as the name
    extractedCourseCodes.add(courseCode)
    extractedCourses.push({
      name: courseCode, // Use only the course code for the name
      creditUnits,
      gradePoint,
      creditUnitFound, // Track if we found credit units
      gradeFound, // Track if we found a grade
    })
  }

  return extractedCourses
}

/**
 * Converts a letter grade to grade points based on the grading scale
 */
export function convertGradeToPoints(grade: string, maxGrade: number): number {
  if (maxGrade === 5) {
    // 5-point scale
    switch (grade) {
      case "A":
      case "A+":
        return 5
      case "B":
      case "B+":
        return 4
      case "C":
      case "C+":
        return 3
      case "D":
      case "D+":
        return 2
      case "E":
      case "E+":
        return 1
      case "F":
        return 0
      default:
        return 0
    }
  } else {
    // 4-point scale
    switch (grade) {
      case "A":
      case "A+":
        return 4
      case "B":
      case "B+":
        return 3
      case "C":
      case "C+":
        return 2
      case "D":
      case "D+":
        return 1
      case "F":
        return 0
      default:
        return 0
    }
  }
}

/**
 * Generates example courses as a fallback
 */
export function generateExampleCourses(maxGrade: number): ExtractedCourse[] {
  return [
    { name: "MATH 101", creditUnits: 3, gradePoint: 0 },
    { name: "COMP 202", creditUnits: 4, gradePoint: 0 },
    { name: "PHYS 105", creditUnits: 3, gradePoint: 0 },
    { name: "ENGL 211", creditUnits: 3, gradePoint: 0 },
  ]
}
