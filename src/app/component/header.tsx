"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { CgProfile } from "react-icons/cg"
import { BellRing } from "lucide-react" // Updated icon for a more professional look
import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { FileText } from "lucide-react"
import { Bell } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User, LogIn, Settings} from "lucide-react"
import { Badge } from "@/components/ui/badge"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"


type User = {
  id: string
  email: string
  name?: string
  phone?: string
  address?: string
  pinNumber?: string
  reraNumber?: string
  document?: string[]
  bankName?: string
  accountNumber?: string
  confirmAccountNumber?: string
  ifscCode?: string
  recipientName?: string
  image?: string // Add this line
}

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [notificationCount, setNotificationCount] = useState(3)
 

  const handleProfileClick = () => {
    router.push("/profile")
  }

 
  const handleNotificationsClick = () => {
    setNotificationCount(0) // Reset count when clicked
    router.push("/notifications") // Navigate to notifications page instead of showing alert
  }

  return (
    <motion.header
      className="bg-gradient-to-br from-amber-300 to-yellow-300  p-4 flex items-center justify-between z-10 shadow-sm"
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo */}
      <div className="flex items-center">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push("/dashboard")}
          className="cursor-pointer"
        >
          <Image
            src="/logo.png"
            alt="TREC Logo"
            width={200}
            height={50}
            style={{ filter: "brightness(0) saturate(100%) invert(50%) sepia(92%) saturate(7400%) hue-rotate(0deg)" }}
            className="object-contain filter invert-[22%] sepia-[100%] saturate-[10000%] hue-rotate-[0deg] brightness-[103%] contrast-[104%]"           />
        </motion.div>
      </div>

     

      {/* Right Side Icons */}
      <div className="flex gap-4 items-center">
     
{/* FileText Icon (Reports or Docs) */}

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <FileText className="h-8 w-8 text-gray-700" />
            </motion.div>
  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <div className="relative">
                <Bell className="h-8 w-8 text-red-600 fill-red-600" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
              </div>
            </motion.div>
          
        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="cursor-pointer flex items-center"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.image || "/placeholder.svg"} alt={user?.name || "User"} />
                <AvatarFallback className="bg-amber-600 text-white font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {isAuthenticated ? (
              <>
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>My Account</span>
                    <span className="text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={() => router.push("/login")} className="cursor-pointer">
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Sign in</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>View Profile</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  )
}