"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {  toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

// Base API URL - you can change this to your production URL when deploying
// Use environment variable for better security and flexibility
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.realestatecompany.co.in/api"

// Improved User type with better organization
type User = {
  id: string
  email: string
  // Personal information
  name?: string
  phone?: string
  address?: string
  image?: string
  // Professional information
  reraNumber?: string
  document?: string[]
  pinNumber?: string
  // Banking information
  bankName?: string
  accountNumber?: string
  confirmAccountNumber?: string
  ifscCode?: string
  recipientName?: string
}

// API response types for better type safety
type ApiResponse<T> = {
  success: boolean
  message: string
  data?: T
}

type AuthResponse = {
  token: string
  user: User
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string) => Promise<void>
  verifyOtp: (email: string, otp: string) => Promise<boolean>
  register: (email: string) => Promise<void>
  verifyRegistrationOtp: (email: string, otp: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  skipAuth: () => void
  updateUserProfile: (userData: Partial<User>) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function for API calls to reduce code duplication
async function apiRequest<T>(endpoint: string, method = "GET", body?: object, token?: string): Promise<ApiResponse<T>> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = await response.json()

    return {
      success: response.ok,
      message: data.message || (response.ok ? "Success" : "Request failed"),
      data: data as T,
    }
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get the token from localStorage
        const token = localStorage.getItem("authToken")

        if (!token) {
          setIsLoading(false)
          return
        }

        // Fetch user data from API
        const response = await apiRequest<User>("/profile", "GET", undefined, token)

        if (response.success && response.data) {
          setUser(response.data)
        } else {
          // If the token is invalid, clear it
          localStorage.removeItem("authToken")
        }
      } catch (error) {
        console.error("Authentication error:", error)
        localStorage.removeItem("authToken")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string) => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address", {
        position: "top-right",
        autoClose: 5000,
      })
      return
    }

    setIsLoading(true)
    try {
      // Call the API to send OTP
      const response = await apiRequest<{ message: string }>("/sendotp", "POST", { email })

      if (response.success) {
        // Store email temporarily for OTP verification
        sessionStorage.setItem("pendingAuthEmail", email)

        toast.info(response.message || "Please check your email for the verification code", {
          autoClose: 5000,
          closeButton: true,
          position: "top-right",
        })
        router.push("/verify-otp")
      } else {
        throw new Error(response.message || "Failed to send OTP")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to send OTP. Please try again.", {
        autoClose: 5000,
        closeButton: true,
        position: "top-right",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    if (!otp || otp.length < 4) {
      toast.error("Please enter a valid OTP", {
        position: "top-right",
        autoClose: 5000,
      })
      return false
    }

    setIsLoading(true)
    try {
      // Call the API to verify OTP
      const response = await apiRequest<AuthResponse>("/verifyotp", "POST", { email, otp })

      if (response.success && response.data) {
        // Save the token
        localStorage.setItem("authToken", response.data.token)

        // Set user data
        setUser(response.data.user)

        toast.success("You have successfully logged in", {
          autoClose: 5000,
          closeButton: true,
          position: "top-right",
        })

        // Redirect to profile page on successful login
        router.push("/profile")

        return true
      } else {
        toast.error(response.message || "Invalid OTP. Please try again.", {
          autoClose: 5000,
          closeButton: true,
          position: "top-right",
        })
        return false
      }
    } catch (error) {
      console.error("OTP verification error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to verify OTP. Please try again.", {
        autoClose: 5000,
        closeButton: true,
        position: "top-right",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string) => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address", {
        position: "top-right",
        autoClose: 5000,
      })
      return
    }

    setIsLoading(true)
    try {
      // Call the API to register and send OTP
      const response = await apiRequest<{ message: string }>("/register", "POST", { email })

      if (response.success) {
        // Store email temporarily for OTP verification
        sessionStorage.setItem("pendingRegistrationEmail", email)

        toast.info(response.message || "Please check your email for the verification code", {
          autoClose: 5000,
          closeButton: true,
          position: "top-right",
        })

        router.push("/verify-registration-otp")
      } else {
        throw new Error(response.message || "Failed to register")
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to register. Please try again.", {
        autoClose: 5000,
        closeButton: true,
        position: "top-right",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const verifyRegistrationOtp = async (email: string, otp: string): Promise<{ success: boolean; message?: string }> => {
    if (!otp || otp.length < 4) {
      return { success: false, message: "Please enter a valid OTP" }
    }

    try {
      const response = await apiRequest<{ message: string }>("/verifyregistrationotp", "POST", { email, otp })

      if (!response.success) {
        console.error("OTP Verification Failed:", response.message)
        return { success: false, message: response.message || "Invalid OTP" }
      }

      return { success: true, message: response.message || "OTP Verified Successfully!" }
    } catch (error) {
      console.error("API Error:", error)
      return { success: false, message: "Something went wrong. Please try again." }
    }
  }

  const updateUserProfile = async (userData: Partial<User>): Promise<boolean> => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("authToken")
  
      if (!token) {
        throw new Error("Authentication required")
      }
  
      // Ensure `id` is defined
      if (!user?.id) {
        throw new Error("User ID is required")
      }
  
      // Call the API to update user profile
      const response = await apiRequest<User>("/profile", "PUT", userData, token)
  
      if (response.success && response.data) {
        setUser(response.data) // Update state with new user data
  
        toast.success("Profile updated successfully", {
          autoClose: 5000,
          closeButton: true,
          position: "top-right",
        })
  
        router.push("/profile") // Redirect to the profile page
  
        return true
      } else {
        throw new Error(response.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("Profile update error:", error)
      toast.error(error instanceof Error ? error.message : "Profile update failed. Please try again.", {
        autoClose: 5000,
        closeButton: true,
        position: "top-right",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }
  
  const logout = async () => {
    try {
      const token = localStorage.getItem("authToken")

      if (token) {
        // Call the API to logout (optional - for server-side session management)
        await apiRequest("/logout", "POST", undefined, token).catch((err) => console.error("Logout API error:", err))
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear local storage and state regardless of API response
      localStorage.removeItem("authToken")
      localStorage.removeItem("authSkipped")
      sessionStorage.removeItem("pendingAuthEmail")
      sessionStorage.removeItem("pendingRegistrationEmail")
      setUser(null)

      toast.success("You have been successfully logged out", {
        autoClose: 5000,
        closeButton: true,
        position: "top-right",
        onClick: () => router.push("/login"),
      })
    }
  }

  const skipAuth = () => {
    // Set a flag in localStorage to indicate the user skipped auth
    localStorage.setItem("authSkipped", "true")
    router.push("/profile")
  }

  // Create a value object outside the JSX for better readability
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    verifyOtp,
    register,
    verifyRegistrationOtp,
    logout,
    skipAuth,
    updateUserProfile,
  }

  return (
    <AuthContext.Provider value={contextValue}>
     
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

