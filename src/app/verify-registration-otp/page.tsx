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
import { ArrowLeft, UserCheck } from "lucide-react"
import Image from "next/image"

export default function VerifyRegistrationOtpPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [email, setEmail] = useState("")
  const { verifyRegistrationOtp, isLoading } = useAuth()
  const router = useRouter()
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("pendingRegistrationEmail")
    if (!storedEmail) {
      router.replace("/register")
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
    if (value && index < 5 && inputRefs.current[index + 1] instanceof HTMLInputElement) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1] instanceof HTMLInputElement) {
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

    if (!email) {
      console.error("No email found in sessionStorage!")
      return
    }

    const otpString = otp.join("")
    if (otpString.length !== 6) {
      console.error("Invalid OTP format")
      return
    }

    const response = await verifyRegistrationOtp(email, otpString)

    if (response.success) {
      router.push("/profile")
    } else {
      console.error("OTP Verification Failed:", response.message)
      alert(response.message)
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
      className="flex flex-col min-h-screen text-gray-800 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Full-screen background image */}
      <div className="fixed inset-0 z-0">
        <Image src="https://www.loft.co.uk/cdn/shop/files/Install_Team_Chapel_Wharf_LOFT_46.jpg" alt="Background" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-black/30" /> {/* Overlay to ensure text readability */}
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen p-5 relative z-10">
        {/* Back button */}
        <motion.div
          className="w-full max-w-md mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Link href="/register" className="inline-flex items-center text-white hover:text-blue-200 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span>Back to registration</span>
          </Link>
        </motion.div>

        <motion.div
          className="w-full max-w-md bg-white/20 backdrop-blur-lg rounded-xl shadow-lg p-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="mb-8 text-center" variants={itemVariants}>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <UserCheck className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Almost There!</h1>
            <p className="text-gray-600 text-sm">We've sent a verification code to</p>
            <p className="text-gray-800 font-medium text-sm">{email || "your email"}</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div className="space-y-4" variants={itemVariants}>
              <label htmlFor="otp-1" className="text-sm font-medium text-gray-700 block text-center">
                Enter 6-digit verification code
              </label>

              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <motion.div key={index} whileFocus={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
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
                      className="h-14 text-center text-xl font-bold border-2 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    />
                  </motion.div>
                ))}
              </div>

              <p className="text-xs text-center text-gray-500">For demo purposes, enter any 6-digit code</p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2"
                disabled={isLoading || otp.some((digit) => !digit)}
              >
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    Verify & Create Account
                  </>
                )}
              </Button>
            </motion.div>

            <motion.div className="text-center space-y-4" variants={itemVariants}>
              <p className="text-sm text-gray-600">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  onClick={() => {
                    // Add resend logic here
                    console.log("Resend code")
                  }}
                >
                  Resend
                </button>
              </p>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400 font-medium">Or</span>
                </div>
              </div>

              <Link
                href="/register"
                className="inline-block text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Try a different email address
              </Link>
            </motion.div>
          </form>
        </motion.div>

        <motion.div
          className="mt-8 text-center text-sm text-white/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          © {new Date().getFullYear()} TREC. All rights reserved.
        </motion.div>
      </div>
    </motion.div>
  )
}
