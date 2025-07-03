"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import LoadingSpinner from "@/components/loading-spinner"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react'
import Image from "next/image"
import {toast} from "sonner"

export default function CompleteRegistrationPage() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  })
  const { completeRegistration, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("pendingRegistrationEmail")
    const storedName = sessionStorage.getItem("pendingRegistrationName")
    const storedPhone = sessionStorage.getItem("pendingRegistrationPhone")
    const otpVerified = sessionStorage.getItem("otpVerified")
    
    if (!storedEmail || !otpVerified) {
      router.replace("/register")
      return
    }
    
    setEmail(storedEmail)
    setName(storedName || "")
    setPhone(storedPhone || "")
  }, [router])

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long"
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter"
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter"
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number"
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return "Password must contain at least one special character"
    }
    return ""
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    const error = validatePassword(value)
    setErrors(prev => ({
      ...prev,
      password: error,
    }))
    
    // Also validate confirm password if it's filled
    if (confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: value !== confirmPassword ? "Passwords do not match" : "",
      }))
    }
  }

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value)
    setErrors(prev => ({
      ...prev,
      confirmPassword: value !== password ? "Passwords do not match" : "",
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      console.error("No email found in sessionStorage!")
      return
    }

    // Validate password
    const passwordError = validatePassword(password)
    if (passwordError) {
      setErrors(prev => ({ ...prev, password: passwordError }))
      return
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }))
      return
    }

    const response = await completeRegistration(email, password)

    if (response.success) {
toast.success("Registration completed successfully! You can now log in.")
      router.push("/login")
        
    }
    // Error handling is done in the auth provider with toast notifications
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

  const isFormValid = password && confirmPassword && !errors.password && !errors.confirmPassword

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
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen p-5 relative z-10">
        {/* Back button */}
        <motion.div
          className="w-full max-w-md mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Link
            href="/register/verify-otp"
            className="inline-flex items-center text-white hover:text-blue-200 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span>Back to verification</span>
          </Link>
        </motion.div>

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
            <h1 className="text-xl font-bold text-gray-800 mb-2">Almost Done!</h1>
            <p className="text-gray-600 text-sm">Create a secure password to complete your registration</p>
            {name && (
              <p className="text-gray-800 font-medium text-sm mt-2">Welcome, {name}!</p>
            )}
            <p className="text-gray-600 text-xs">{email}</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div className="space-y-2" variants={itemVariants}>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password *
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={`pl-10 pr-10 h-12 rounded-full ${
                    errors.password ? "border-red-500" : "border-gray-200 focus:border-blue-500"
                  }`}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  className="text-sm text-red-500"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring" }}
                >
                  {errors.password}
                </motion.p>
              )}
              <div className="text-xs text-gray-500 space-y-1">
                <p>Password must contain:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li className={password.length >= 8 ? "text-green-600" : ""}>At least 8 characters</li>
                  <li className={/(?=.*[a-z])/.test(password) ? "text-green-600" : ""}>One lowercase letter</li>
                  <li className={/(?=.*[A-Z])/.test(password) ? "text-green-600" : ""}>One uppercase letter</li>
                  <li className={/(?=.*\d)/.test(password) ? "text-green-600" : ""}>One number</li>
                  <li className={/(?=.*[@$!%*?&])/.test(password) ? "text-green-600" : ""}>One special character</li>
                </ul>
              </div>
            </motion.div>

            <motion.div className="space-y-2" variants={itemVariants}>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password *
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  className={`pl-10 pr-10 h-12 rounded-full ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-200 focus:border-blue-500"
                  }`}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  className="text-sm text-red-500"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring" }}
                >
                  {errors.confirmPassword}
                </motion.p>
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center gap-2"
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Complete Registration
                  </>
                )}
              </Button>
            </motion.div>

            <motion.div className="text-center" variants={itemVariants}>
              <p className="text-xs text-gray-500">
                By completing registration, you agree to our{" "}
                <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
                  Privacy Policy
                </Link>
              </p>
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
