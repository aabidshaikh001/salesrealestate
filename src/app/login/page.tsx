"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import LoadingSpinner from "@/components/loading-spinner"
import { motion } from "framer-motion"
import Image from "next/image"
import { useEffect } from "react"

export default function LoginPage() {

  useEffect(() => {
  const savedEmail = localStorage.getItem("rememberedEmail")
  const savedPassword = localStorage.getItem("rememberedPassword")

  if (savedEmail && savedPassword) {
    setEmail(savedEmail)
    setPassword(savedPassword)
    setRememberMe(true)

  }
}, [])

  // In your main app component
useEffect(() => {
  const handleTokenMessage = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    
    if (event.data.type === 'AUTH_TOKEN' && event.data.token) {
      localStorage.setItem('authToken', event.data.token);

      // You might want to fetch user data here
      window.location.href = '/dashboard'; // Redirect to dashboard or home page
    }
  };

  window.addEventListener('message', handleTokenMessage);
  return () => window.removeEventListener('message', handleTokenMessage);
}, []);
  const [email, setEmail] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [password, setPassword] = useState("")
  const { loginWithPassword, isLoading, handleFacebookLogin, handleGoogleLogin } = useAuth()
  const [isValidEmail, setIsValidEmail] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

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

  if (!password.trim()) return

  setIsValidEmail(true)

  // Save or clear based on "remember me"
  if (rememberMe) {
    localStorage.setItem("rememberedEmail", email)
    localStorage.setItem("rememberedPassword", password)
    
  } else {
    localStorage.removeItem("rememberedEmail")
    localStorage.removeItem("rememberedPassword")
  }

  await loginWithPassword(email, password)
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
        <div className="absolute inset-0 bg-black/30" /> {/* Overlay to ensure text readability */}
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
            <h1 className="text-2xl font-bold text-blue-900">Welcome back!</h1>
            <p className="text-gray-800 mt-2">Sign in to continue</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div className="space-y-2" variants={itemVariants}>
              <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`h-12 rounded-full ${!isValidEmail ? "border-red-500" : "border-gray-200"}`}
                disabled={isLoading}
                required
              />
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

            <motion.div className="space-y-2" variants={itemVariants}>
              <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-full border-gray-200 pr-10"
                  disabled={isLoading}
                  required
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
<motion.div className="flex items-center justify-between text-sm" variants={itemVariants}>
  <label className="flex items-center gap-2 text-gray-700">
  <input
  type="checkbox"
  className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded-full focus:ring-blue-500"
  checked={rememberMe}
  onChange={(e) => setRememberMe(e.target.checked)}
/>
    Remember me
  </label>
  <Link href="/forgot-password" className="text-blue-600 hover:text-blue-800">
    Forgot password?
  </Link>
</motion.div>
            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full"
                disabled={isLoading || !email.trim() || !password.trim()}
              >
                {isLoading ? <LoadingSpinner /> : "Sign In"}
              </Button>
            </motion.div>
          </form>

        
{/* 
          <motion.div className="relative w-full my-6" variants={itemVariants}>
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
              Don&apos;t have any account?{" "}
              <Link href="/register" className="font-medium text-blue-600 hover:text-blue-800">
                Sign up
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
