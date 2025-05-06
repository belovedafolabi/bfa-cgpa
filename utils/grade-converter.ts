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
