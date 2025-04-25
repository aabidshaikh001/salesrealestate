"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  LogOut,
  Edit2,
  User,
  FileText,
  CreditCard,
  ArrowLeft,
  Phone,
  MapPin,
  Key,
  Mail,
  ChevronRight,
  Shield,
  Download,
  Building,
  AlertCircle,
} from "lucide-react"

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      <p className="text-muted-foreground">Loading your profile...</p>
    </div>
  )
}

interface InfoItemProps {
  icon: React.ReactNode
  label: string
  value: string | undefined
  isSecure?: boolean
}

function InfoItem({ icon, label, value, isSecure }: InfoItemProps) {
  return (
    <motion.div
      className="flex items-center border-b border-gray-100 pb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium">
          {value || "Not provided"}
          {isSecure && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              <Shield className="h-3 w-3 mr-1" />
              Secure
            </span>
          )}
        </p>
      </div>
    </motion.div>
  )
}

function DocumentItem({ name, type }: { name: string; type: string }) {
  return (
    <motion.div
      className="flex items-center border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-shrink-0 mr-3">
        <div className="w-12 h-16 bg-blue-50 rounded flex items-center justify-center">
          <FileText className="h-6 w-6 text-blue-500" />
        </div>
      </div>
      <div className="flex-1">
        <div className="flex flex-col">
          <span className="text-sm font-medium">{name}</span>
          <span className="text-xs text-gray-500">{type}</span>
        </div>
      </div>
      <button className="text-blue-500 p-2 hover:bg-blue-50 rounded-full transition-colors">
        <Download className="h-5 w-5" />
      </button>
    </motion.div>
  )
}

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("personal")

  
  // Mock document data with types
  const documentData = user?.document
    ? [
        { name: user.document[0] || "aadhaar_card.pdf", type: "Aadhaar Card" },
        { name: user.document[1] || "pan_card.pdf", type: "PAN Card" },
      ]
    : []

  // Check if user skipped auth
  useEffect(() => {
    const skippedAuth = localStorage.getItem("authSkipped")
    if (!isAuthenticated && !skippedAuth) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  const isGuest = !isAuthenticated

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout()
    }
  }

  // Function to determine if user is verified based on available data
  const isUserVerified = () => {
    // Consider a user verified if they have both RERA number and documents
    return Boolean(user?.reraNumber && user?.document && user.document.length > 0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center p-4 border-b bg-white shadow-sm sticky top-0 z-10">
        <Link href="/" className="mr-4 hover:bg-gray-100 p-2 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-medium">My Profile</h1>
        {isAuthenticated && (
          <button
            className="ml-auto text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </header>

      {isGuest ? (
        <div className="p-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="mb-8 overflow-hidden border-none shadow-md">
              <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              <CardHeader className="pb-2">
                <CardTitle>Guest Mode</CardTitle>
                <CardDescription>You are browsing as a guest. Sign in to access all features.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-6 py-6">
                <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center -mt-20 border-4 border-white shadow">
                  <User className="h-12 w-12 text-blue-500" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-semibold">Welcome, Guest</h2>
                  <p className="text-muted-foreground">Create an account to save your information</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                    <Link href="/register">Create Account</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      ) : (
        <>
          <Tabs defaultValue="personal" className="w-full" onValueChange={setActiveTab} value={activeTab}>
            <TabsList className="grid w-full grid-cols-2 sticky top-16 z-10 bg-white border-b">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="bank">Bank Info</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="p-4 space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                {/* Background Gradient Section */}
                <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
                  <Button asChild className="absolute top-4 right-4" variant="outline" size="sm">
                    <Link href="/add-profile">
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Link>
                  </Button>

                  {/* Profile Image Overlay */}
                  <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 h-32 w-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white flex items-center justify-center">
                    {user?.image ? (
                      <Image
                        src={user.image || "/placeholder.svg"}
                        alt={user.name || "Profile"}
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="bg-blue-100 h-full w-full flex items-center justify-center">
                        <User className="h-16 w-16 text-blue-500" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <div className="flex flex-col items-center mt-16 mb-6">
                    <h2 className="text-2xl font-bold mt-4">{user?.name || "User"}</h2>
                    <p className="text-gray-500 text-sm">{user?.id}</p>
                    {isUserVerified() && (
                      <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified Account
                      </span>
                    )}
                  </div>

                  {/* User Information */}
                  <div className="space-y-4">
                    <InfoItem icon={<Mail className="h-5 w-5 text-blue-500" />} label="Email" value={user?.email} />
                    <InfoItem icon={<Phone className="h-5 w-5 text-blue-500" />} label="Phone" value={user?.phone} />
                    <InfoItem
                      icon={<MapPin className="h-5 w-5 text-blue-500" />}
                      label="Address"
                      value={user?.address}
                    />
                    <InfoItem
                      icon={<Key className="h-5 w-5 text-blue-500" />}
                      label="PIN Number"
                      value={user?.pinNumber}
                    />
                    <InfoItem
                      icon={<Shield className="h-5 w-5 text-blue-500" />}
                      label="RERA Number"
                      value={user?.reraNumber}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Documents Section */}
              <motion.div
                className="bg-white rounded-lg p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  Documents
                </h2>

                {documentData.length > 0 ? (
                  <div className="space-y-3">
                    {documentData.map((doc, index) => (
                      <DocumentItem key={index} name={doc.name} type={doc.type} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                    <FileText className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No documents uploaded</p>
                    <Button asChild variant="link" className="mt-2">
                      <Link href="/add-profile">Upload Documents</Link>
                    </Button>
                  </div>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="bank" className="p-4 space-y-6">
              <motion.div
                className="bg-white rounded-lg shadow-sm overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
                  <Button asChild className="absolute top-4 right-4" variant="outline" size="sm">
                    <Link href="/add-profile">
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit Bank Details
                    </Link>
                  </Button>
                </div>

                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
                    Bank Information
                  </h2>

                  {!user?.bankName && !user?.accountNumber && (
                    <div className="flex items-center p-4 mb-6 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                      <p className="text-sm text-amber-700">
                        Your bank details are not complete. Please add your bank information to receive payments.
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <InfoItem
                      icon={<Building className="h-5 w-5 text-blue-500" />}
                      label="Bank Name"
                      value={user?.bankName}
                    />

                    <InfoItem
                      icon={<CreditCard className="h-5 w-5 text-blue-500" />}
                      label="Account Number"
                      value={
                        user?.accountNumber
                          ? `${user.accountNumber.substring(0, 4)}...${user.accountNumber.substring(
                              user.accountNumber.length - 4,
                            )}`
                          : undefined
                      }
                      isSecure
                    />

                    <InfoItem
                      icon={<FileText className="h-5 w-5 text-blue-500" />}
                      label="IFSC Code"
                      value={user?.ifscCode}
                    />

                    <InfoItem
                      icon={<User className="h-5 w-5 text-blue-500" />}
                      label="Recipient Name"
                      value={user?.recipientName}
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white rounded-lg p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

                <div className="space-y-2">
                  <Link
                    href="#"
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <Download className="h-5 w-5 text-blue-500" />
                      </div>
                      <span>Download Bank Statement</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </Link>

                  <Link
                    href="#"
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <Shield className="h-5 w-5 text-blue-500" />
                      </div>
                      <span>Verify Account</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </Link>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

