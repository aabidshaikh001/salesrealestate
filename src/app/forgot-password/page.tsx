"use client"

import React, { useState } from "react"
import { useAuth } from "@/providers/auth-provider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import LoadingSpinner from "@/components/loading-spinner"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import Image from "next/image"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { forgotPassword } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await forgotPassword(email)
      setEmailSent(true)
      toast.success("If an account exists with this email, a reset link has been sent", {
        position: "top-right",
        autoClose: 5000,
      })
    } catch (error) {
      toast.error("Failed to send reset email. Please try again.", {
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
            <h1 className="text-xl font-bold text-blue-900">Forgot Password</h1>
            <p className="mt-2 text-gray-800">
              {emailSent
                ? "Check your email for a reset link"
                : "Enter your email to receive a password reset link"}
            </p>
          </motion.div>

          {!emailSent ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <motion.div className="space-y-2" variants={itemVariants}>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-full border-gray-200 bg-white/80"
                  disabled={isLoading}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full"
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? <LoadingSpinner /> : "Send Reset Link"}
                </Button>
              </motion.div>
            </form>
          ) : (
            <motion.div className="text-center" variants={itemVariants}>
              <p className="text-gray-800 mb-4">
                If you don't see the email, check your spam folder.
              </p>
              <Button
                onClick={() => router.push("/login")}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full"
              >
                Back to Login
              </Button>
            </motion.div>
          )}

          <motion.div className="text-center text-sm text-gray-800 mt-6" variants={itemVariants}>
            Remember your password?{" "}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
