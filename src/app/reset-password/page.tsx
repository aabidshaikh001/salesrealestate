"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import LoadingSpinner from "@/components/loading-spinner"
import { toast } from "react-toastify"
import { useAuth } from "@/providers/auth-provider"
import Image from "next/image"

export default function ResetPassword() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const searchParams = useSearchParams()
  const { resetPassword } = useAuth()

  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setTokenValid(false)
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match", {
        position: "top-right",
        autoClose: 5000,
      })
      return
    }

    if (!token) {
      toast.error("Invalid reset link", {
        position: "top-right",
        autoClose: 5000,
      })
      return
    }

    setIsLoading(true)
    
    try {
      await resetPassword(token, password)
      // toast.success("Password updated successfully", {
      //   position: "top-right",
      //   autoClose: 5000,
      // })
    } catch (error) {
      toast.error("Failed to reset password. The link may have expired.", {
        position: "top-right",
        autoClose: 5000,
      })
    } finally {
      setIsLoading(false)
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

  if (!tokenValid) {
    return (
      <motion.div
        className="flex flex-col min-h-screen text-gray-800 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Full-screen background image */}
        <div className="fixed inset-0 z-0">
          <Image
            src="https://www.loft.co.uk/cdn/shop/files/Install_Team_Chapel_Wharf_LOFT_46.jpg"
            alt="Background"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="flex flex-col items-center justify-center min-h-screen p-5 relative z-10">
          <motion.div
            className="w-full max-w-md bg-white/20 backdrop-blur-lg rounded-xl shadow-lg p-8 text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <h1 className="text-3xl font-bold text-blue-900 mb-4">Invalid Link</h1>
              <p className="text-gray-800 mb-6">
                The password reset link is invalid or has expired. Please request a new one.
              </p>
              <Button
                asChild
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full"
              >
                <a href="/forgot-password">Request New Link</a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    )
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
        <Image
          src="https://www.loft.co.uk/cdn/shop/files/Install_Team_Chapel_Wharf_LOFT_46.jpg"
          alt="Background"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen p-5 relative z-10">
        <motion.div
          className="w-full max-w-md bg-white/20 backdrop-blur-lg rounded-xl shadow-lg p-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
             <motion.div className="mb-8 text-left" variants={itemVariants}>
              <Image
                          src="/logo.png"
                          alt="Logo"
                          width={250}
                          height={250}
                          className="mx-auto"
                           style={{ filter: "brightness(0) saturate(100%) invert(50%) sepia(92%) saturate(7400%) hue-rotate(0deg)" }}
                        />
            <h1 className="text-3xl font-bold text-blue-900">Reset Password</h1>
            <p className="mt-2 text-gray-800">Enter your new password below</p>
          </motion.div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <motion.div className="space-y-2" variants={itemVariants}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-full border-gray-200 pr-10 bg-white/80"
                  required
                  minLength={8}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </motion.div>

            <motion.div className="space-y-2" variants={itemVariants}>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 rounded-full border-gray-200 bg-white/80"
                required
                minLength={8}
                disabled={isLoading}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full"
                disabled={isLoading || !password || !confirmPassword}
              >
                {isLoading ? <LoadingSpinner /> : "Reset Password"}
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  )
}
