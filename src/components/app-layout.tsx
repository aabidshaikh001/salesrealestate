"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"

import { motion, AnimatePresence } from "framer-motion"
import {
  FiArrowLeft,
  FiMenu,
  FiHome,
  FiUser,
  FiUsers,
  FiCalendar,
  FiBell,
  FiSettings,
  FiLogOut,
  FiCheckSquare,
} from "react-icons/fi"
import { LuIndianRupee } from "react-icons/lu";
import { Sheet, SheetContent, SheetHeader,  SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Footer from "../app/component/footer"
import { useAuth } from "@/providers/auth-provider"


interface AppLayoutProps {
  children: React.ReactNode
  title: string
  backUrl?: string
}

export function AppLayout({ children, title, backUrl }: AppLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(3)
  const { user } = useAuth()

  const menuItems = [
    { icon: FiHome, label: "Home", path: "/dashboard" },
    { icon: FiBell, label: "Notifications", path: "/notifications", badge: unreadNotifications },
    { icon: FiUsers, label: "Leads", path: "/assigned-leads" },
    { icon: FiCheckSquare, label: "Tasks", path: "/tasks" },
    { icon: FiCalendar, label: "Calendar", path: "/calendar" },
    { icon: LuIndianRupee, label: "Revenue", path: "/revenue" },
    { icon: FiUser, label: "Profile", path: "/profile" },
    { icon: FiSettings, label: "Settings", path: "/settings" },
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsMenuOpen(false)
  }

  const handleLogout = () => {
    router.push("/login")
  }
  const getInitials = (name: string) => {
    const words = name.trim().split(" ");
    const first = words[0]?.[0] || "";
    const last = words[words.length - 1]?.[0] || "";
    return (first + last).toUpperCase();
  };
  

  return (
  
    <div className="flex flex-col min-h-screen bg-background pb-16 md:pb-0">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b shadow-sm">
        <div className="flex items-center h-14 md:h-16 px-3 md:px-4">
          {backUrl ? (
            <Button variant="ghost" size="icon" onClick={() => router.push(backUrl)} className="mr-2">
              <FiArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <FiMenu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <div className="h-full flex flex-col">
                  <SheetHeader className="p-6 text-left border-b">
                  <Image
  src="/logo.png"
  alt="The Real Estate"
  width={120}
  height={32}
  style={{ filter: "brightness(0) saturate(100%) invert(50%) sepia(92%) saturate(7400%) hue-rotate(0deg)" }}
className="object-contain filter invert-[22%] sepia-[100%] saturate-[10000%] hue-rotate-[0deg] brightness-[103%] contrast-[104%]"           
/>

                    <div className="flex items-center space-x-3 mt-4">
                      <Avatar>
                        <AvatarImage src={user?.image} alt={user?.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(user?.name || "User")}
                          </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user?.name}</p>
                       
                      </div>
                    </div>
                  </SheetHeader>

                  <div className="flex-1 overflow-auto py-2">
                    <div className="space-y-1 px-2">
                      {menuItems.map((item, index) => (
                        <Button
                          key={index}
                          variant={pathname === item.path ? "secondary" : "ghost"}
                          className="w-full justify-start h-12"
                          onClick={() => handleNavigation(item.path)}
                        >
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.label}
                          {item.badge && (
                            <Badge className="ml-auto" variant="destructive">
                              {item.badge}
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 border-t">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-destructive hover:text-destructive h-12"
                      onClick={handleLogout}
                    >
                      <FiLogOut className="mr-3 h-5 w-5" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
          <h1 className="text-lg font-semibold">{title}</h1>

          {!backUrl && (
  <div className="ml-auto flex items-center space-x-2">
    {/* Notification */}
    <Button variant="ghost" size="icon" onClick={() => router.push("/notifications")}>
      <div className="relative">
        <FiBell className="h-5 w-5" />
        {unreadNotifications > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center">
            {unreadNotifications}
          </Badge>
        )}
      </div>
    </Button>

    {/* Profile dropdown */}
    <div className="relative group">
      <Button variant="ghost" size="icon" className="h-10 w-10 p-0">
        <Avatar>
          <AvatarImage src={user?.image} alt={user?.name} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(user?.name || "User")}
          </AvatarFallback>
        </Avatar>
      </Button>

      <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-zinc-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
        <button
          onClick={() => router.push("/profile")}
          className="block w-full px-4 py-2 text-sm hover:bg-accent text-left"
        >
          Profile
        </button>
        <button
          onClick={() => router.push("/settings")}
          className="block w-full px-4 py-2 text-sm hover:bg-accent text-left"
        >
          Settings
        </button>
        <button
          onClick={handleLogout}
          className="block w-full px-4 py-2 text-sm text-destructive hover:bg-accent text-left"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
)}

        </div>
      </header>

      <main className="flex-1 max-w-screen-md mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
    
  )
}