"use client"

import {
  ArrowLeft,
  ChevronRight,
  LogOut,
  Edit2,
  User,
  Settings,
  Users,
  FileText,
  HelpCircle,
  MessageSquare,
  BookOpen,
} from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Footer from "../component/footer"
import Header from "../component/header"
import { useAuth } from "@/providers/auth-provider"
import LoadingSpinner from "@/components/loading-spinner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ProtectedRoute from "@/providers/ProtectedRoute"


export default function ProfileDashboardPage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [profileImage, setProfileImage] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is authenticated
    if (!isLoading && !isAuthenticated) {
      const skippedAuth = localStorage.getItem("authSkipped")

      if (!skippedAuth) {
        // Redirect to login if not authenticated and not skipped auth
        toast.info("Please sign in to access your profile", {
          autoClose: 5000,
          closeButton: true,
          position: "top-right",
          onClick: () => router.push("/login"),
        })
      }
    }

    // Set profile image if user has one
    if (user?.image) {
      setProfileImage(user.image)
    }
  }, [isLoading, isAuthenticated, user, router])

  const handleLogout = () => {
    toast.info("Are you sure you want to sign out?", {
      autoClose: false,
      closeButton: true,
      position: "top-right",
      onClick: () => logout(),
    })
  }

  const handleEditProfile = () => {
    if (isAuthenticated) {
      router.push("/add-profile")
    } else {
      toast.info("Please sign in to edit your profile", {
        autoClose: 5000,
        closeButton: true,
        position: "top-right",
        onClick: () => router.push("/login"),
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
  <ProtectedRoute>
    <div className="pb-20 min-h-screen bg-gray-50">
      <Header />
      <ToastContainer />
      <header className="flex items-center p-4 border-b bg-white shadow-sm sticky top-0 z-10">
        <Link href="/dashboard" className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-medium">Profile</h1>
        <button className="ml-auto" onClick={handleEditProfile}>
          <Edit2 className="h-5 w-5" />
        </button>
      </header>

      <div className="flex flex-col items-center py-6 bg-white shadow-sm mb-4">
        <div className="relative mb-2">
          <Avatar className="h-24 w-24 border-2 border-red-500 shadow-lg">
            <AvatarImage src={profileImage || "/placeholder.svg"} alt={user?.name || "User"} />
            <AvatarFallback className="bg-red-500 text-white font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <button
            className="absolute bottom-0 right-0 bg-red-500 rounded-full p-1.5 shadow-md"
            onClick={handleEditProfile}
          >
            <Edit2 className="h-4 w-4 text-white" />
          </button>
        </div>
        <h2 className="text-xl font-semibold">{isAuthenticated ? user?.name || "User" : "Guest User"}</h2>
        <p className="text-gray-500 text-sm">{isAuthenticated ? user?.id : "Guest Mode"}</p>
        {!isAuthenticated && (
          <Link href="/login" className="mt-2 text-sm text-red-500 font-medium">
            Sign in to access all features
          </Link>
        )}
      </div>

      <div className="px-4 space-y-2">
        <ProfileMenuItem
          icon={<User className="h-5 w-5 text-red-500" />}
          title="Personal details"
          href={isAuthenticated ? "/profile/personal-details" : "/login"}
          onClick={
            !isAuthenticated
              ? () => {
                  toast.info("Please sign in to view your personal details", {
                    autoClose: 5000,
                    closeButton: true,
                    position: "top-right",
                    onClick: () => router.push("/login"),
                  })
                }
              : undefined
          }
        />
        <ProfileMenuItem
          icon={<Settings className="h-5 w-5 text-red-500" />}
          title="Preferences"
          href="/profile/preferences"
        />
        <ProfileMenuItem
          icon={<Users className="h-5 w-5 text-red-500" />}
          title="Community Support"
          href="/profile/community"
        />
        <ProfileMenuItem
          icon={<FileText className="h-5 w-5 text-red-500" />}
          title="Terms & Conditions"
          href="/profile/terms"
        />
        <ProfileMenuItem
          icon={<HelpCircle className="h-5 w-5 text-red-500" />}
          title="Support"
          href="/profile/support"
        />
        <ProfileMenuItem
          icon={<MessageSquare className="h-5 w-5 text-red-500" />}
          title="Raise Query"
          href="/profile/query"
        />
        <ProfileMenuItem
          icon={<BookOpen className="h-5 w-5 text-red-500" />}
          title="Tutorial"
          href="/profile/tutorial"
        />

        {isAuthenticated ? (
          <button
            className="flex items-center w-full py-3 px-2 bg-gray-50 rounded-lg text-red-500"
            onClick={handleLogout}
          >
            <span className="flex items-center justify-center w-8 h-8 mr-3">
              <LogOut className="h-5 w-5 text-red-500" />
            </span>
            <span>Sign Out</span>
          </button>
        ) : (
          <Link href="/login" className="flex items-center w-full py-3 px-2 bg-gray-50 rounded-lg text-red-500">
            <span className="flex items-center justify-center w-8 h-8 mr-3">
              <User className="h-5 w-5 text-red-500" />
            </span>
            <span>Sign In</span>
          </Link>
        )}
      </div>

      <Footer />
    </div>
  </ProtectedRoute>
  )
}

interface ProfileMenuItemProps {
  icon: React.ReactNode
  title: string
  href: string
  onClick?: () => void
}

function ProfileMenuItem({ icon, title, href, onClick }: ProfileMenuItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <Link
      href={href}
      className="flex items-center justify-between py-3 px-2 bg-gray-50 rounded-lg"
      onClick={handleClick}
    >
      <div className="flex items-center">
        <span className="flex items-center justify-center w-8 h-8 mr-3">{icon}</span>
        <span>{title}</span>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-400" />
    </Link>
  )
}