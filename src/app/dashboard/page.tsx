"use client"

import { motion } from "framer-motion"
import { useAuth } from "@/providers/auth-provider"
import { useRouter } from "next/navigation"
import { Building2, Users, Target, DollarSign, Bell, FileText } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Header from "../component/header"
import Footer from "../component/footer"
import ProtectedRoute from "@/providers/ProtectedRoute"

const dashboardCards = [
  {
    title: "Properties",
     image:"https://cdn-icons-png.flaticon.com/512/68/68967.png",
    href: "/Properties",
    color: "text-blue-600",
    iconBg: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    title: "Leads",
    image:"https://c1.10times.com/odash/images/conversion.svg",
    href: "/leads",
    color: "text-red-600",
    iconBg: "bg-red-50",
    borderColor: "border-red-200",
  },
  {
    title: "Targets",
    image:"https://cdn-icons-png.flaticon.com/128/4126/4126319.png",
    href: "/targets",
    color: "text-green-600",
    iconBg: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    title: "Revenue",
   image:"https://cdn-icons-png.flaticon.com/128/912/912220.png",
    href: "/revenue",
    color: "text-yellow-600",
    iconBg: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
]

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  // Get user's first name for greeting
  const firstName = user?.name?.split(" ")[0] || "User"

  return (
  <ProtectedRoute>
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header />

      <div className="">
       <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="bg-gradient-to-br from-amber-300 to-yellow-300 rounded-b-3xl p-8 mb-8 relative overflow-hidden"
>

          <div className="flex items-start gap-4 mb-6">
            <Avatar className="h-20 w-20 border-3 border-amber-600/30 shadow-lg">
              <AvatarImage src={user?.image || "/placeholder.svg"} alt={user?.name || "User"} />
              <AvatarFallback className="bg-amber-600 text-white text-xl font-bold">
                {firstName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-xl font-light text-gray-800 leading-tight">Hi {firstName}!</h1>
              <p className="text-3xl font-bold text-gray-800">Welcome.</p>
            </div>
          </div>
<div className="flex justify-center items-center gap-4 sm:gap-4">
            {/* <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <div className="relative">
                <Bell className="h-8 w-8 text-red-600 fill-red-600" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
              </div>
            </motion.div> */}

            {/* <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <FileText className="h-8 w-8 text-gray-700" />
            </motion.div> */}
          </div>
        </motion.div>

        {/* Dashboard Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 gap-6 mx-8 max-w-4xl px-4 sm:px-6 lg:mx-auto lg:px-8 mt-6 mb-12"
        >
          {dashboardCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(card.href)}
              className="cursor-pointer"
            >
              <div className={`bg-white rounded-2xl p-6 shadow-sm border-2 ${card.borderColor}`}>
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`${card.iconBg} p-4 rounded-2xl`}>
                    <img src={card.image} alt={card.title} className="h-12 w-12" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-800">{card.title}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <Footer />
    </div>
  </ProtectedRoute>
  )
}
