import Link from "next/link"

export function Footer() {
  return (
    <footer className="mt-12 text-center text-sm text-muted-foreground">
      <p className="mb-2">
        Built with <span className="animate-pulse text-foreground font-extrabold text-lg md:text-xl">❤️</span> by{" "}
        <Link
          href="https://bfa-portfolio.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-amber-600 hover:decoration-amber-400 dark:decoration-amber-300 dark:hover:decoration-amber-500 font-semibold"
        >
          BFA
        </Link>
      </p>
      <p>© {new Date().getFullYear()} GPA Calculator. All rights reserved.</p>
    </footer>
  )
}
