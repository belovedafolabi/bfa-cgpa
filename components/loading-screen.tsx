"use client"

import { motion } from "framer-motion"

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
          className="mb-4"
        >
          <div className="w-16 h-16 border-4 border-foreground border-t-transparent rounded-full animate-spin mx-auto"></div>
        </motion.div>
        <motion.h2
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
          className="text-2xl font-bold text-foreground"
        >
          CGPA Calculator Loading...
        </motion.h2>
      </motion.div>
    </div>
  )
}
