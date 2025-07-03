"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import LoadingSpinner from "@/components/loading-spinner"
import { motion } from "framer-motion"
import { ArrowLeft, Mail, User, Phone } from 'lucide-react'
import Image from "next/image"
import { useEffect } from "react"

export default function RegisterStep1Page() {
  // In your main app component
useEffect(() => {
  const handleTokenMessage = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    
    if (event.data.type === 'AUTH_TOKEN' && event.data.token) {
      localStorage.setItem('authToken', event.data.token);
      // You might want to fetch user data here
      window.location.href = '/dashboard';
    }
  };

  window.addEventListener('message', handleTokenMessage);
  return () => window.removeEventListener('message', handleTokenMessage);
}, []);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const { registerStep1, isLoading, handleFacebookLogin, handleGoogleLogin } = useAuth()
  const router = useRouter()

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      phone: "",
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^\+?[\d\s\-$$$$]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== "")
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const response = await registerStep1(formData.name, formData.email, formData.phone)

    if (response.success) {
      router.push("/register/verify-otp")
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
          <Link href="/register" className="inline-flex items-center text-white hover:text-blue-200 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span>Back</span>
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
            <h1 className="text-xl font-bold text-gray-800 mb-2">Create Account</h1>
            <p className="text-gray-600">Enter your details to get started</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div className="space-y-2" variants={itemVariants}>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Full Name *
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`pl-10 h-12 rounded-full ${
                    errors.name ? "border-red-500" : "border-gray-200 focus:border-blue-500"
                  }`}
                  disabled={isLoading}
                  required
                />
              </div>
              {errors.name && (
                <motion.p
                  className="text-sm text-red-500"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring" }}
                >
                  {errors.name}
                </motion.p>
              )}
            </motion.div>

            <motion.div className="space-y-2" variants={itemVariants}>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address *
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`pl-10 h-12 rounded-full ${
                    errors.email ? "border-red-500" : "border-gray-200 focus:border-blue-500"
                  }`}
                  disabled={isLoading}
                  required
                />
              </div>
              {errors.email && (
                <motion.p
                  className="text-sm text-red-500"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring" }}
                >
                  {errors.email}
                </motion.p>
              )}
            </motion.div>

            <motion.div className="space-y-2" variants={itemVariants}>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone Number *
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`pl-10 h-12 rounded-full ${
                    errors.phone ? "border-red-500" : "border-gray-200 focus:border-blue-500"
                  }`}
                  disabled={isLoading}
                  required
                />
              </div>
              {errors.phone && (
                <motion.p
                  className="text-sm text-red-500"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring" }}
                >
                  {errors.phone}
                </motion.p>
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full"
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner /> : "Continue"}
              </Button>
            </motion.div>

            <motion.div className="mt-6 text-center text-xs text-gray-500" variants={itemVariants}>
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-blue-600">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-600">
                Privacy Policy
              </Link>
            </motion.div>
          </form>

          {/* <motion.div className="relative w-full my-6" variants={itemVariants}>
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/80 px-2 rounded-full text-gray-800 font-medium">Or continue with</span>
            </div>
          </motion.div>

          <motion.div className="grid grid-cols-2 gap-4" variants={itemVariants}>
            <Button
              variant="outline"
              className="h-12 border-gray-200 bg-white hover:bg-gray-50 font-medium rounded-full flex items-center justify-center"
              onClick={handleGoogleLogin}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" className="mr-2">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
            <Button
              variant="outline"
              className="h-12 border-gray-200 bg-white hover:bg-gray-50 font-medium rounded-full flex items-center justify-center"
              onClick={handleFacebookLogin}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="mr-2">
                <path
                  fill="#1877F2"
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                />
              </svg>
              Facebook
            </Button>
          </motion.div> */}

          <motion.div className="mt-8 text-center" variants={itemVariants}>
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-800">
                Sign in
              </Link>
            </p>
          </motion.div>
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
