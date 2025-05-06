export function BackgroundGrid() {
  return (
    <div className="fixed inset-0 grid grid-cols-[repeat(20,1fr)] grid-rows-[repeat(20,1fr)] opacity-[0.03] pointer-events-none dark:opacity-[0.02]">
      {Array.from({ length: 20 }).map((_, i) =>
        Array.from({ length: 20 }).map((_, j) => (
          <div key={`${i}-${j}`} className="border-r border-b border-black dark:border-white" />
        )),
      )}
    </div>
  )
}
