"use client"
import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {  toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.realestatecompany.co.in/api"
type User = {
  id: string
  email: string
  // Personal information
  name?: string
  phone?: string
  address?: string
  image?: string
  reraNumber?: string
  document?: string[]
  pinNumber?: string
  bankName?: string
  accountNumber?: string
  confirmAccountNumber?: string
  ifscCode?: string
  recipientName?: string
}

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
  logout: () => void
  loginWithPassword: (email: string, password: string) => Promise<boolean>
  updateUserProfile: (userData: Partial<User>) => Promise<boolean>
  registerStep1: (name: string, email: string, phone: string) => Promise<{ success: boolean; message?: string }>;
  verifyRegistrationOtp: (email: string, otp: string) => Promise<{ 
    success: boolean; 
    message?: string;
    userDetails?: { name: string; phone: string };
  }>;
  completeRegistration: (email: string, password: string) => Promise<{
    success: boolean;
    message?: string;
    token?: string;
    user?: User;
  }>;
  handleGoogleLogin: () => Promise<void>;
  handleFacebookLogin: () => Promise<void>;
  resendOTP: (email: string, purpose: "login" | "registration") => Promise<boolean>;
  
  
    
  token: string | null
  forgotPassword: (email: string) => Promise<boolean>
  resetPassword: (token: string, newPassword: string) => Promise<boolean>
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
    }}}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
   const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
 const [token, setToken] = useState<string | null>(null)
 const router = useRouter()
// Initialize auth state from localStorage (client-side only)
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem("authToken") : null
      setToken(storedToken)
      
      if (storedToken) {
        fetchUserProfile(storedToken)
      } else {
        setIsLoading(false)
      }
    }
    initializeAuth()
  }, [])

  // Keep localStorage in sync with token state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem("authToken", token)
      } else {
        localStorage.removeItem("authToken")
      }
    }
  }, [token])

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await apiRequest<User>("/user/profile", "GET", undefined, token)

      if (response.success && response.data) {
        setUser(response.data)
      } else {
        // Invalid token - clear it
        setToken(null)
        localStorage.removeItem("authToken")
      }
    } catch (error) {
      console.error("Authentication error:", error)
      setToken(null)
      localStorage.removeItem("authToken")
    } finally {
      setIsLoading(false)
    }
  }

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
        router.push("/dashboard")

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

 
  const updateUserProfile = async (userData: Partial<User>): Promise<boolean> => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("authToken")
  
      if (!token) {
        throw new Error("Authentication required")
      }
      if (!user?.id) {
        throw new Error("User ID is required")
      }
      const response = await apiRequest<User>("/user/profile", "PUT", userData, token)
  
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
  
const loginWithPassword = async (email: string, password: string): Promise<boolean> => {
  if (!email || !password) {
    toast.error("Please enter both email and password", {
      position: "top-right",
      autoClose: 5000,
    })
    return false
  }

  setIsLoading(true)

  try {
    const response = await apiRequest<AuthResponse>("/login-password", "POST", { email, password })

    if (response.success && response.data) {
      localStorage.setItem("authToken", response.data.token)
      localStorage.setItem("token", response.data.token) // Store token in localStorage
        setToken(response.data.token) // Use state setter
      setUser(response.data.user)
      setIsLoading(false)
      toast.success("Sign in successful", {
        position: "top-right",
        autoClose: 5000,
      })

      router.push("/dashboard")
      return true
    } else {
      toast.error(response.message || "Login failed", {
        position: "top-right",
        autoClose: 5000,
      })
      return false
    }
  } catch (error) {
    console.error("Password login error:", error)
    toast.error("Sign in failed. Please try again.", {
      position: "top-right",
      autoClose: 5000,
    })
    return false
  } finally {
    setIsLoading(false)
  }
}

 // Update logout to properly clear state
  const logout = async () => {
    try {
      if (token) {
        await apiRequest("/logout", "POST", undefined, token).catch(console.error)
      }
    } finally {
      // Clear all state and storage
      setToken(null)
      setUser(null)
      localStorage.removeItem("authToken")
      localStorage.removeItem("authSkipped")
      sessionStorage.clear()
      
      toast.success("You have been successfully logged out")
      router.push("/login")
    }
  }
  const registerStep1 = async (name: string, email: string, phone: string) => {
  setIsLoading(true);
  try {
    const response = await apiRequest<{ 
      message: string; 
      email: string; 
      phone: string 
    }>("/register/step1", "POST", { name, email, phone });

    if (response.success) {
      sessionStorage.setItem("pendingRegistrationEmail", email);
      sessionStorage.setItem("pendingRegistrationPhone", phone);
      sessionStorage.setItem("pendingRegistrationName", name);
      
      return { 
        success: true, 
        message: response.message || "OTP sent successfully" 
      };
    } else {
      return { 
        success: false, 
        message: response.message || "Failed to send OTP" 
      };
    }
  } catch (error) {
    console.error("Registration step 1 error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Registration failed" 
    };
  } finally {
    setIsLoading(false);
  }
};
const verifyRegistrationOtp = async (email: string, otp: string) => {
  setIsLoading(true);
  try {
    const response = await apiRequest<{ 
      message: string; 
      name: string; 
      phone: string;
      verified: boolean;
    }>("/register/verify-otp", "POST", { email, otp });

    if (response.success && response.data?.verified) {
      sessionStorage.setItem("otpVerified", "true");
      return { 
        success: true, 
        message: response.message || "OTP verified successfully",
        userDetails: {
          name: response.data.name,
          phone: response.data.phone
        }
      };
    } else {
      return { 
        success: false, 
        message: response.message || "OTP verification failed" 
      };
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "OTP verification failed" 
    };
  } finally {
    setIsLoading(false);
  }
};
const completeRegistration = async (email: string, password: string) => {
  setIsLoading(true);
  try {
    const response = await apiRequest<AuthResponse>("/register/complete", "POST", { email, password });

    if (response.success && response.data) {
      localStorage.setItem("authToken", response.data.token);
      setUser(response.data.user);
      // Clear session storage
      sessionStorage.removeItem("pendingRegistrationEmail");
      sessionStorage.removeItem("pendingRegistrationPhone");
      sessionStorage.removeItem("pendingRegistrationName");
      sessionStorage.removeItem("otpVerified");
      
      toast.success("Registration completed successfully. Please login.", {
        autoClose: 5000,
        closeButton: true,
        position: "top-right",
      });
      
      // Redirect to login page
      router.push("/login");
      
      return { 
        success: true, 
        message: "Registration completed successfully",
        token: response.data.token,
        user: response.data.user
      };
    } else {
      return { 
        success: false, 
        message: response.message || "Registration completion failed" 
      };
    }
  } catch (error) {
    console.error("Registration completion error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Registration completion failed" 
    };
  } finally {
    setIsLoading(false);
  }
};
// In your auth-provider.tsx
const handleGoogleLogin = async () => {
  setIsLoading(true);
  try {
    // Open Google auth in a popup or redirect
    window.open(`${API_BASE_URL}/auth/google`, '_blank');
    
    // Alternatively, you can use a redirect approach
    // window.location.href = `${API_BASE_URL}/auth/google`;
  } catch (error) {
    console.error("Google login error:", error);
    toast.error("Failed to initiate Google login");
  } finally {
    setIsLoading(false);
  }
};

const handleFacebookLogin = async () => {
  setIsLoading(true);
  try {
    window.open(`${API_BASE_URL}/auth/facebook`, '_blank');
  } catch (error) {
    console.error("Facebook login error:", error);
    toast.error("Failed to initiate Facebook login");
  } finally {
    setIsLoading(false);
  }
};
const resendOTP = async (email: string, purpose: "login" | "registration"): Promise<boolean> => {
  setIsLoading(true);
  try {
    const response = await apiRequest<{ message: string }>("/resend-otp", "POST", { email, purpose });

    if (response.success) {
      toast.success(response.message || "New OTP sent successfully", {
        autoClose: 5000,
        closeButton: true,
        position: "top-right",
      });
      return true;
    } else {
      throw new Error(response.message || "Failed to resend OTP");
    }
  } catch (error) {
    console.error("Resend OTP error:", error);
    toast.error(error instanceof Error ? error.message : "Failed to resend OTP. Please try again.", {
      autoClose: 5000,
      closeButton: true,
      position: "top-right",
    });
    return false;
  } finally {
    setIsLoading(false);
  }
};
const forgotPassword = async (email: string): Promise<boolean> => {
  setIsLoading(true);
  try {
    const response = await apiRequest<{ message: string }>("/auth/forgot-password", "POST", { email });

    if (response.success) {
      return true;
    } else {
      throw new Error(response.message || "Failed to send reset email");
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

// Update the reset password handler in the auth provider
const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
  setIsLoading(true);
  try {
    const response = await apiRequest<{ message: string }>(
      "/auth/reset-password",
      "POST",
      { token, newPassword }
    );

    if (response.success) {
      toast.success("Password reset successfully!", {
        position: "top-right",
        autoClose: 5000,
      });
      router.push("/login"); // Redirect to login page after successful reset
    
      return true;
    } else {
      throw new Error(response.message || "Failed to reset password");
    }
  } catch (error) {
    console.error("Reset password error:", error);
    let errorMessage = "Failed to reset password";
    
    if (error instanceof Error) {
      if (error.message.includes("expired")) {
        errorMessage = "The reset link has expired. Please request a new one.";
      } else if (error.message.includes("invalid")) {
        errorMessage = "Invalid reset link. Please check the URL or request a new one.";
      } else {
        errorMessage = error.message;
      }
    }

    toast.error(errorMessage, {
      position: "top-right",
      autoClose: 5000,
    });
    return false;
  } finally {
    setIsLoading(false);
  }
};
  // Create a value object outside the JSX for better readability
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    verifyOtp,
    register,
    
    logout,
    
    updateUserProfile,
    loginWithPassword,
    registerStep1,
    verifyRegistrationOtp,
    completeRegistration,
    handleGoogleLogin,
    handleFacebookLogin,
     resendOTP,
  
    token,
    forgotPassword,
    resetPassword,
 
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

