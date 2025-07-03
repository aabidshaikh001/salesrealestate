"use client"

import { motion } from "framer-motion"

interface ProgressTrackerProps {
  currentStep: number
}

const steps = [
  { label: "Lead Assigned", step: 0 },
  { label: "Visit Scheduled", step: 1 },
  { label: "Discussion", step: 2 },
  { label: "Loan", step: 3 },
  { label: "Closure", step: 4 },
]

export function ProgressTracker({ currentStep }: ProgressTrackerProps) {
  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > index
          const isActive = currentStep === index

          return (
            <div key={index} className="flex flex-col items-center relative">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{
                  scale: isActive ? 1.2 : 1,
                  backgroundColor: isCompleted || isActive ? "#3b82f6" : "#e5e7eb",
                }}
                className="w-5 h-5 rounded-full flex items-center justify-center z-10"
              >
                {isCompleted && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </motion.div>

              {index < steps.length - 1 && (
                <div
                  className="absolute top-2.5 left-5 h-0.5 w-full"
                  style={{
                    background: `linear-gradient(to right, ${isCompleted ? "#3b82f6" : "#e5e7eb"} 50%, ${
                      currentStep > index + 1 ? "#3b82f6" : "#e5e7eb"
                    } 50%)`,
                  }}
                />
              )}

              <span className="text-xs mt-2 text-center max-w-[60px]">{step.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
