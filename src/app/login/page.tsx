"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import LoadingSpinner from "@/components/loading-spinner"
import { ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { FaArrowLeft, FaEnvelope, FaUserAlt } from "react-icons/fa"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const { login, isLoading, skipAuth } = useAuth()
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
    await login(email)
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
      className="flex flex-col min-h-screen bg-white text-gray-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Mobile-like status bar */}
      <div className="h-12 bg-red-600 w-full flex items-center px-4">
        <Link href="/" className="text-white flex items-center">
          <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.9 }}>
            <FaArrowLeft className="h-5 w-5 mr-2" />
          </motion.div>
          <span className="font-medium">Back</span>
        </Link>
      </div>

      {/* Header section with logo */}
      <motion.div
        className="px-5 pt-8 pb-6 bg-red-600 text-white"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="p-1"
          >
            <Image src="/logo.png" alt="Company Logo" width={120} height={60} />
          </motion.div>
        </div>

        <motion.h1
          className="text-2xl font-bold text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Welcome back!
        </motion.h1>
        <motion.p
          className="mt-1 opacity-90 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Glad to see you, Again!
        </motion.p>
      </motion.div>

      {/* Main content */}
      <motion.div className="flex-1 px-5 pt-6" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div className="mb-6" variants={itemVariants}>
          <h2 className="text-xl font-semibold">Sign In</h2>
          <p className="text-gray-500 text-sm mt-1">Enter your email to receive a verification code</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div className="space-y-2" variants={itemVariants}>
            <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>

              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`h-14 rounded-xl bg-gray-50 border pl-10 ${
                  !isValidEmail ? "border-red-500" : "border-gray-200 focus:border-red-500"
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
          </motion.div>
        </form>

        <motion.div className="mt-8" variants={itemVariants}>
          <div className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-red-600">
              <motion.span whileHover={{ color: "#2563EB" }} transition={{ duration: 0.2 }}>
                Sign up
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Fixed bottom action buttons - mobile app style */}
      <motion.div
        className="px-5 py-4 border-t border-gray-100 bg-white"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring" }}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleSubmit}
            className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                Continue with Email
                <ChevronRight className="ml-1 h-5 w-5" />
              </>
            )}
          </Button>
        </motion.div>

        <div className="relative w-full my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400 font-medium">Or</span>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            className="w-full h-14 border-gray-200 text-gray-700 hover:bg-gray-50 font-medium rounded-xl flex items-center justify-center"
            onClick={skipAuth}
          >
            <FaUserAlt className="mr-2 h-4 w-4" />
            Continue as Guest
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
