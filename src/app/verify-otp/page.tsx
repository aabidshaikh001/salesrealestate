"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import LoadingSpinner from "@/components/loading-spinner"
import { motion } from "framer-motion"
import { FaArrowLeft, FaEnvelope, FaShieldAlt } from "react-icons/fa"

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [email, setEmail] = useState("")
  const { verifyOtp, isLoading } = useAuth()
  const router = useRouter()
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Get the email from session storage
    const storedEmail = sessionStorage.getItem("pendingAuthEmail")
    if (!storedEmail) {
      // Redirect to login if no email is found
      router.push("/login")
      return
    }
    setEmail(storedEmail)

    // Focus the first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [router])

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value

    setOtp(newOtp)

    // Auto-focus next input if current input is filled
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("")
      setOtp(digits)

      // Focus the last input
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus()
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      const otpString = otp.join("")
      await verifyOtp(email, otpString)
    }
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

  return (
    <motion.div
      className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Left side decoration - visible on larger screens */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 bg-red-600 items-center justify-center relative overflow-hidden"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-red-700 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/placeholder.svg?height=800&width=800')",
              backgroundSize: "cover",
              mixBlendMode: "overlay",
            }}
          ></div>
        </div>
        <div className="relative z-10 text-white text-center max-w-md p-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
            <p className="text-red-100 mb-6">
              We&apos;re excited to have you back. Please verify your identity to continue.
            </p>
            <div className="flex justify-center">
              <FaShieldAlt className="text-white opacity-20 h-32 w-32" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right side - form */}
      <motion.div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8" variants={itemVariants}>
        <div className="w-full max-w-md">
          <motion.div className="mb-8" variants={itemVariants}>
            <Link href="/login" className="inline-flex items-center text-red-600 hover:text-red-800 transition-colors">
              <FaArrowLeft className="mr-2 h-4 w-4" />
              <span>Back to login</span>
            </Link>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
            variants={itemVariants}
          >
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                  <FaEnvelope className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Verify Your Email</h1>
                  <p className="text-gray-600 text-sm">
                    We&apos;ve sent a code to <span className="font-medium">{email || "your email"}</span>
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <label htmlFor="otp-1" className="text-sm font-medium text-gray-700 block">
                    Enter verification code
                  </label>

                  <div className="flex justify-between gap-2">
                    {otp.map((digit, index) => (
                      <motion.div
                        key={index}
                        whileFocus={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full"
                      >
                        <Input
                          id={`otp-${index + 1}`}
                          ref={(el) => {
                            inputRefs.current[index] = el
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={index === 0 ? handlePaste : undefined}
                          disabled={isLoading}
                          required
                          className="h-14 text-center text-xl font-bold border-2 focus:border-red-500 focus:ring-red-500"
                        />
                      </motion.div>
                    ))}
                  </div>

                  <p className="text-xs text-center text-gray-500">For demo purposes, enter any 6-digit code</p>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2"
                    disabled={isLoading || otp.some((digit) => !digit)}
                  >
                    {isLoading ? <LoadingSpinner /> : "Verify & Sign In"}
                  </Button>
                </motion.div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Didn&apos;t receive a code?{" "}
                    <Link href="/login" className="font-medium text-red-600 hover:text-red-800 transition-colors">
                      Try again
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </motion.div>

          <motion.div className="mt-8 text-center text-sm text-gray-500" variants={itemVariants}>
            © {new Date().getFullYear()} Your Company. All rights reserved.
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
