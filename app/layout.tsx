import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "GPATrack - GPA & CGPA Calculator",
  description:
    "Easily calculate your GPA and CGPA with support for 4.0 and 5.0 grading systems. Input your course grades and credit units to track academic progress accurately.",
  keywords: [
    "GPA calculator",
    "CGPA calculator",
    "university grading",
    "4 point scale",
    "5 point scale",
    "grade point average",
    "academic tracking",
    "student tools",
    "credit unit calculator",
    "GPA tracker",
    "CGPA formula",
    "exam results",
    "college GPA",
    "GPATrack"
  ],
  authors: [{ name: "GPATrack", url: "https://gpa-track.vercel.app" }],
  creator: "GPATrack Team",
  publisher: "GPATrack",
  applicationName: "GPATrack - GPA & CGPA Calculator",
  openGraph: {
    title: "GPATrack - GPA & CGPA Calculator",
    description:
      "A powerful and easy-to-use GPA/CGPA calculator for students. Track your academic performance with accurate grading logic and a clean interface.",
    type: "website",
    url: "https://gpa-track.vercel.app",
    images: ["/images/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@GPATrackApp",
    title: "GPATrack - GPA & CGPA Calculator",
    description:
      "Easily calculate and manage your GPA or CGPA on a 4 or 5-point scale. Built for university students.",
    images: ["/images/og.png"],
  },
  generator: "Afolabi F. Beloved",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
