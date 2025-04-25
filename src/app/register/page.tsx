"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import LoadingSpinner from "@/components/loading-spinner"
import { motion } from "framer-motion"
import { ArrowLeft, Mail } from "lucide-react"
import Image from "next/image"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const { register, isLoading } = useAuth()
  const [isValidEmail, setIsValidEmail] = useState(true)

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      setIsValidEmail(false)
      return
    }

    setIsValidEmail(true)
    await register(email)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  // Mobile app view
  return (
    <motion.div
      className="flex flex-col min-h-screen bg-white"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Mobile app status bar area - simulated */}
      <div className="h-6 bg-white w-full"></div>

      {/* Mobile app header with back button */}
      <motion.div className="flex items-center px-4 py-3 border-b border-gray-100" variants={itemVariants}>
        <Link href="/" className="text-gray-800">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="flex-1 text-center font-medium">Create Account</div>
        <div className="w-6"></div> {/* Empty div for balanced header */}
      </motion.div>

      {/* Main content - with padding bottom to account for fixed buttons */}
      <motion.div className="flex-1 flex flex-col px-5 pt-6 pb-32" variants={itemVariants}>
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logo.png"
            alt="Logo"
            width={120}
            height={60}
            className="h-14 object-contain filter invert-[22%] sepia-[100%] saturate-[10000%] hue-rotate-[0deg] brightness-[103%] contrast-[104%]"
            style={{ filter: "brightness(0) saturate(100%) invert(50%) sepia(92%) saturate(7400%) hue-rotate(0deg)" }}
          />
        </div>

        {/* Welcome text */}
        <motion.div className="mb-8 text-center" variants={itemVariants}>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome</h1>
          <p className="text-gray-600">Enter your email to get started</p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-10 h-12 rounded-xl ${
                  !isValidEmail ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-500"
                }`}
                disabled={isLoading}
                required
              />
            </div>
            {!isValidEmail && (
              <motion.p
                className="text-sm text-red-500"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring" }}
              >
                Please enter a valid email address
              </motion.p>
            )}
          </div>

          {/* Sign in link - moved up from bottom */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-red-600">
                Sign in
              </Link>
            </p>
          </div>

          {/* Terms - moved up from bottom */}
          <motion.div className="mt-6 text-center text-xs text-gray-500" variants={itemVariants}>
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-red-600">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-red-600">
              Privacy Policy
            </Link>
          </motion.div>

          {/* Fixed bottom action buttons - rendered outside the normal flow */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-14 rounded-xl border-gray-300"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center gap-2 text-base"
                  disabled={isLoading}
                >
                  {isLoading ? <LoadingSpinner /> : "Continue"}
                </Button>
              </motion.div>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
