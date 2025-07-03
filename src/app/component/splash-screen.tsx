'use client'
import { motion } from "framer-motion";
import Image from "next/image"; // Use this if you're in a Next.js project



export default function SplashScreen() {
 return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Gradient background matching the image */}
      <div className="fixed inset-0 bg-gradient-to-b from-orange-100 via-white to-orange-200" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">
      {/* Logo - THE REAL ESTATE COMPANY */}
<motion.div
  className="text-center mb-16"
  initial={{ opacity: 0, y: -30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, ease: "easeOut" }}
>
  <motion.div
    className="relative"
    animate={{
      scale: [1, 1.02, 1],
    }}
    transition={{
      duration: 3,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    }}
  >
   <Image 
             src="/logo.png" 
             alt="TREC Logo" 
             width={260} 
             height={50} 
              style={{ filter: "brightness(0) saturate(100%) invert(50%) sepia(92%) saturate(7400%) hue-rotate(0deg)" }}
         className="object-contain filter invert-[22%] sepia-[100%] saturate-[10000%] hue-rotate-[0deg] brightness-[103%] contrast-[104%]" 
           />
  </motion.div>
</motion.div>

        {/* TREC Sales */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <motion.h1
            className="text-5xl font-bold text-blue-500 tracking-wide"
            animate={{
              textShadow: [
                "0 0 0px rgba(59, 130, 246, 0)",
                "0 0 10px rgba(59, 130, 246, 0.3)",
                "0 0 0px rgba(59, 130, 246, 0)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            TREC | Sales
          </motion.h1>
        </motion.div>

        

        {/* Loading indicator */}
        <motion.div
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-blue-400 rounded-full"
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
