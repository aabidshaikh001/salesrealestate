"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { BsBuildingsFill } from "react-icons/bs"
import { toast } from "sonner"
import {
  FiCalendar,
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiImage,
  FiX,
  FiUpload,
  FiList,
  FiUser,
  FiUsers,
  FiFileText,
  FiEye
} from "react-icons/fi"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/providers/auth-provider"

interface UserMeeting {
  MeetingId: number
  LeadId: number
  OrgCode: number
  MeetingCode: string
  MeetingDate: string
  MeetingTime: string
  Duration: number
  LocationType: string
  Location: string | null
  Agenda: string
  Attendees: string
  Notes: string
  Status: string
  IsEmailSent: boolean
  EmailSentDate: string | null
  CreatedBy: string
  CreatedAt: string
  UpdatedAt: string
  IsDeleted: boolean
  LeadName: string
  LeadEmail: string
  LeadMobile: string
  ImageCount: number
  imageCount: number
}

interface LeadData {
  LeadId: number
  Name: string
  Mobile: string
  Email: string
  LeadCode: string
  ProjectCode?: string
  StatusName?: string
  LeadSourceId?: number
  PropertyName?: string
  Source?: string
}

interface MeetingData {
  date: string
  time: string
  location: string
  customLocation: string
  duration: string
  agenda: string
  attendees: string
  notes: string
}

interface MeetingImage {
  id: string
  file: File
  preview: string
  name: string
}

interface Property {
  PropertyId: string
  title: string
  location: string
  price: string
  pricePerSqft: string
  superBuiltUpArea: string
  images?: string[]
  PropertyType: string
  bhkOptions?: string[] // Add this line
  error?: string
  [key: string]: any // Allow additional properties
}

interface MeetingResponse {
  meetingId: string
  message: string
}

export default function PersonalMeetingPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, token } = useAuth()
  const [leadData, setLeadData] = useState<LeadData | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [meetingData, setMeetingData] = useState<MeetingData>({
    date: "",
    time: "",
    location: "office",
    customLocation: "",
    duration: "30",
    agenda: "",
    attendees: "",
    notes: "",
  })
  const [API_BASE_URL] = useState(process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.realestatecompany.co.in")
  const [meetingImages, setMeetingImages] = useState<MeetingImage[]>([])
   const [property, setProperty] = useState<Property | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userMeetings, setUserMeetings] = useState<UserMeeting[]>([])
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const today = new Date()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blankDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const timeSlots = [
    { time: "09:00", label: "9:00 AM" },
    { time: "09:30", label: "9:30 AM" },
    { time: "10:00", label: "10:00 AM" },
    { time: "10:30", label: "10:30 AM" },
    { time: "11:00", label: "11:00 AM" },
    { time: "11:30", label: "11:30 AM" },
    { time: "12:00", label: "12:00 PM" },
    { time: "12:30", label: "12:30 PM" },
    { time: "14:00", label: "2:00 PM" },
    { time: "14:30", label: "2:30 PM" },
    { time: "15:00", label: "3:00 PM" },
    { time: "15:30", label: "3:30 PM" },
    { time: "16:00", label: "4:00 PM" },
    { time: "16:30", label: "4:30 PM" },
    { time: "17:00", label: "5:00 PM" },
    { time: "17:30", label: "5:30 PM" },
    { time: "18:00", label: "6:00 PM" },
  ]

  useEffect(() => {
    const fetchLeadData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/propertylead/byleadid/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) {
          throw new Error("Failed to fetch lead data")
        }
        const data: LeadData = await response.json()
        setLeadData(data)
      } catch (error) {
        console.error("Error fetching lead data:", error)
        toast.error("Failed to load lead information")
      }
    }

    if (token) {
      fetchLeadData()
    }
  }, [params.id, token, API_BASE_URL])
  

 useEffect(() => {
  const fetchProperty = async () => {
    if (!leadData?.ProjectCode) return;

    try {
      const response = await fetch(`https://api.realestatecompany.co.in/api/properties/${leadData.ProjectCode}`);
      if (!response.ok) throw new Error("Failed to fetch property");
      const data = await response.json();
      
      // Parse the bhkOptions string into an array
      const parsedProperty = {
        ...data,
        bhkOptions: data.bhkOptions ? JSON.parse(data.bhkOptions) : [],
        images: data.images ? JSON.parse(data.images) : []
      };
      
      setProperty(parsedProperty);
    } catch (error) {
      console.error("Error fetching property:", error);
      toast.error("Failed to load property");
    }
  }

  fetchProperty();
}, [leadData?.ProjectCode]);
 



  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(currentMonth - 1)
    } else {
      newDate.setMonth(currentMonth + 1)
    }
    setCurrentDate(newDate)
  }

  const handleDateSelect = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) {
      toast.error("Cannot select past dates")
      return
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const dayStr = String(date.getDate()).padStart(2, "0")
    const dateString = `${year}-${month}-${dayStr}`

    setMeetingData({
      ...meetingData,
      date: dateString,
    })
  }

  const fetchUserMeetings = async () => {
    if (!user?.id) {
      toast.error("User not authenticated")
      return
    }

    setIsLoadingMeetings(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/meetings/user/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch meetings")
      }

      const data = await response.json()
      setUserMeetings(data.meetings)
    } catch (error) {
      console.error("Error fetching meetings:", error)
      toast.error("Failed to load meetings")
    } finally {
      setIsLoadingMeetings(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setMeetingData({
      ...meetingData,
      [field]: value,
    })
  }

  const handleImageUpload = (files: FileList) => {
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const newImage = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            file,
            preview: e.target?.result as string,
            name: file.name,
          }
          setMeetingImages((prev) => [...prev, newImage])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const handleRemoveImage = (imageId: string) => {
    setMeetingImages((prev) => prev.filter((img) => img.id !== imageId))
  }

  const handleScheduleMeeting = async (): Promise<MeetingResponse | null> => {
    if (!meetingData.date || !meetingData.time) {
      toast.error("Please select date and time for the meeting")
      return null
    }

    if (meetingData.location === "custom" && !meetingData.customLocation) {
      toast.error("Please specify the meeting location")
      return null
    }

    if (!user?.id) {
      toast.error("User not authenticated")
      return null
    }

    setIsSubmitting(true)
    try {
      // Prepare form data
      const formData = new FormData()
      formData.append("leadId", params.id)
      formData.append("date", meetingData.date)
      formData.append("time", meetingData.time)
      formData.append("duration", meetingData.duration)
      formData.append("locationType", meetingData.location)
      formData.append("userId", user.id)

      if (meetingData.location === "custom") {
        formData.append("location", meetingData.customLocation)
      } else if (meetingData.location === "site" && property?.location) {
        formData.append("location", property.location)
      }

      formData.append("agenda", meetingData.agenda)
      formData.append("attendees", meetingData.attendees)
      formData.append("notes", meetingData.notes)

      // Append images
      meetingImages.forEach((image) => {
        formData.append("images", image.file)
      })

      const response = await fetch(`${API_BASE_URL}/api/meetings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to schedule meeting")
      }

      const result: MeetingResponse = await response.json()
      toast.success(
        `Meeting scheduled successfully! ${meetingImages.length > 0 ? `${meetingImages.length} images attached.` : ""}`,
      )
      router.push(`/lead-details/${params.id}`)
      return result
    } catch (error) {
      console.error("Error scheduling meeting:", error)
      toast.error("Failed to schedule meeting. Please try again.")
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendInvite = async () => {
    if (!meetingData.date || !meetingData.time) {
      toast.error("Please schedule the meeting first")
      return
    }

    try {
      // First schedule the meeting
      const meetingResponse = await handleScheduleMeeting()
      if (!meetingResponse) return

      // Then send the invite
      const response = await fetch(`${API_BASE_URL}/api/meetings/${meetingResponse.meetingId}/send-invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to send invitation")
      }

      toast.success("Meeting invitation sent to client")
    } catch (error) {
      console.error("Error sending invite:", error)
      toast.error("Failed to send invitation. Please try again.")
    }
  }

  const isDatePast = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "completed":
        return "bg-green-50 text-green-700 border-green-200"
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200"
      case "in-progress":
        return "bg-orange-50 text-orange-700 border-orange-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return <FiClock size={12} />
      case "completed":
        return <div className="w-3 h-3 bg-green-500 rounded-full" />
      case "cancelled":
        return <FiX size={12} />
      default:
        return <FiClock size={12} />
    }
  }

  const formatMeetingTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatMeetingDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    }
  }

  if (!leadData) {
    return (
      <AppLayout title="Loading..." backUrl={`/lead-details/${params.id}`}>
        <div className="p-4">Loading lead information...</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Schedule Personal Meeting" backUrl={`/lead-details/${params.id}`}>
      <div className="p-4 space-y-4">
        {/* Header with My Meetings Button */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Schedule Meeting</h1>
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsDrawerOpen(true)
                  fetchUserMeetings()
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100 text-blue-700"
              >
                <FiList size={16} />
                My Meetings
                {userMeetings.length > 0 && (
                  <Badge className="bg-blue-600 text-white text-xs px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
                    {userMeetings.length}
                  </Badge>
                )}
              </Button>
            </DrawerTrigger>

            <DrawerContent className="max-h-[85vh] bg-gradient-to-b from-white to-gray-50">
              <DrawerHeader className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <DrawerTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <FiUser size={20} className="text-white" />
                    </div>
                    My Meetings
                  </DrawerTitle>
                  <div className="flex items-center gap-2">
                    {userMeetings.length > 0 && (
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                        {userMeetings.length} meetings
                      </Badge>
                    )}
                  </div>
                </div>
              </DrawerHeader>

              <div className="flex-1 overflow-y-auto">
                {isLoadingMeetings ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                      <div
                        className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-blue-400 rounded-full animate-spin"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                    </div>
                    <p className="mt-4 text-gray-600 font-medium">Loading your meetings...</p>
                    <p className="text-sm text-gray-500 mt-1">Please wait a moment</p>
                  </div>
                ) : userMeetings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6">
                      <FiCalendar className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No meetings yet</h3>
                    <p className="text-gray-600 mb-1">You haven't scheduled any meetings</p>
                    <p className="text-sm text-gray-500">Schedule your first meeting to see it here</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {userMeetings.map((meeting, index) => (
                      <motion.div
                        key={meeting.MeetingId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group"
                      >
                        <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-all duration-200 overflow-hidden">
                          <CardContent className="p-0">
                            {/* Meeting Header */}
                            <div className="p-4 pb-3">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10 border-2 border-gray-100">
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-sm">
                                      {meeting.LeadName?.charAt(0) || "L"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="font-semibold text-gray-900 text-base leading-tight">
                                      {meeting.LeadName}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-0.5">Meeting #{meeting.MeetingCode}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    className={`${getStatusColor(meeting.Status)} border text-xs font-medium px-2 py-1 flex items-center gap-1`}
                                  >
                                    {getStatusIcon(meeting.Status)}
                                    {meeting.Status}
                                  </Badge>
                                 
                                </div>
                              </div>

                              {/* Meeting Details Grid */}
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className="flex items-center gap-2 text-sm">
                                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <FiCalendar size={14} className="text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {formatMeetingDate(meeting.MeetingDate)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(meeting.MeetingDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                  <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
                                    <FiClock size={14} className="text-green-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {formatMeetingTime(meeting.MeetingTime)}
                                    </p>
                                    <p className="text-xs text-gray-500">{meeting.Duration} mins</p>
                                  </div>
                                </div>
                              </div>

                              {/* Location */}
                              <div className="flex items-start gap-2 text-sm mb-3">
                                <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center mt-0.5">
                                  <FiMapPin size={14} className="text-orange-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 capitalize">{meeting.LocationType}</p>
                                  {meeting.Location && (
                                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{meeting.Location}</p>
                                  )}
                                </div>
                              </div>

                              {/* Agenda */}
                              {meeting.Agenda && (
                                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                  <div className="flex items-start gap-2">
                                    <FiFileText size={14} className="text-gray-500 mt-0.5" />
                                    <div className="flex-1">
                                      <p className="text-xs font-medium text-gray-700 mb-1">Agenda</p>
                                      <p className="text-sm text-gray-900 leading-relaxed">{meeting.Agenda}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Attendees */}
                              {meeting.Attendees && (
                                <div className="flex items-center gap-2 text-sm">
                                  <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
                                    <FiUsers size={14} className="text-purple-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-700">Attendees</p>
                                    <p className="text-sm text-gray-900">{meeting.Attendees}</p>
                                  </div>
                                </div>
                              )}

                              {/* Email Status */}
                              {meeting.IsEmailSent && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <p className="text-xs text-gray-600">
                                      Invitation sent on {new Date(meeting.EmailSentDate || "").toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Meeting Actions */}
                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span>Created {new Date(meeting.CreatedAt).toLocaleDateString()}</span>
                                  {meeting.imageCount > 0 && (
                                    <>
                                      <span>•</span>
                                      <div className="flex items-center gap-1">
                                        <FiImage size={12} />
                                        <span>{meeting.imageCount} images</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                               
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {userMeetings.length > 0 && (
                <div className="border-t border-gray-100 bg-white/80 backdrop-blur-sm p-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Total: {userMeetings.length} meetings</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:bg-blue-50"
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </DrawerContent>
          </Drawer>
        </div>

        {/* Lead information card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-4 bg-gradient-to-r from-yellow-100 to-yellow-200 p-4 rounded-lg shadow-sm"
        >
          <Avatar className="h-16 w-16 border-2 border-primary/10">
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {leadData.Name?.charAt(0) || "L"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{leadData.Name}</h2>
            <div className="flex justify-between items-start mt-2">
              <div className="space-y-1">
                {leadData.Mobile && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FiPhone className="mr-1" size={14} />
                    {leadData.Mobile}
                  </div>
                )}
                {leadData.Email && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FiMail className="mr-1" size={14} />
                    {leadData.Email}
                  </div>
                )}
              </div>
              <div className="flex items-center">
                <p className="text-sm font-medium bg-yellow-100 text-yellow-600 rounded-full p-1">
                  {leadData.LeadSourceId === 1 ? "Website" : "Other"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Property Information - Updated to match Share Options width */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-rose-200 p-4 rounded-md shadow-sm space-y-4"
      >
       {property ? (
  <div className="flex items-start justify-between gap-4">
    <div className="flex items-start space-x-4 flex-1">
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{property.title}</h3>
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <FiMapPin className="mr-1" size={14} />
          {property.location}
        </div>
        
        <p className="text-sm font-medium text-green-600 mt-1">
          {property.price} ({property.pricePerSqft}/sq.ft)
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {property.superBuiltUpArea} (Super Built-up)
        </p>
      </div>
    </div>

    {/* Preview Button */}
    <div className="pt-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => router.push(`/property/${property.PropertyId}`)}
      >
        <FiEye className="mr-1" size={14} />
        Preview
      </Button>
    </div>
  </div>
) : (
  <div className="text-center py-4">
    <p>No property information available</p>
  </div>
)}
      </motion.div>
      

        {/* Date & Time Selection */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center">
                <FiCalendar className="mr-2 text-blue-600" />
                Select Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => navigateMonth("prev")} className="h-10 w-10 p-0">
                  <FiChevronLeft size={20} />
                </Button>
                <h3 className="text-lg font-semibold">
                  {monthNames[currentMonth]} {currentYear}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => navigateMonth("next")} className="h-10 w-10 p-0">
                  <FiChevronRight size={20} />
                </Button>
              </div>

              {/* Calendar Grid */}
              <div className="space-y-2">
                <div className="grid grid-cols-7 gap-1">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                    <div key={i} className="text-center text-sm font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {blankDays.map((_, i) => (
                    <div key={i} className="h-12"></div>
                  ))}
                  {days.map((day) => {
                    const date = new Date(currentYear, currentMonth, day)
                    const year = date.getFullYear()
                    const month = String(date.getMonth() + 1).padStart(2, "0")
                    const dayStr = String(date.getDate()).padStart(2, "0")
                    const dateString = `${year}-${month}-${dayStr}`
                    const isSelected = dateString === meetingData.date
                    const isToday =
                      day === today.getDate() &&
                      currentMonth === today.getMonth() &&
                      currentYear === today.getFullYear()
                    const isPast = isDatePast(day)

                    return (
                      <motion.div
                        key={day}
                        whileTap={{ scale: 0.95 }}
                        className={`h-12 flex items-center justify-center rounded-xl cursor-pointer text-sm font-medium transition-all
                          ${isSelected ? "bg-blue-600 text-white shadow-lg" : ""}
                          ${isToday && !isSelected ? "border-2 border-blue-600 text-blue-600" : ""}
                          ${isPast ? "text-gray-300 cursor-not-allowed" : ""}
                          ${!isSelected && !isToday && !isPast ? "hover:bg-blue-50 text-gray-700" : ""}
                        `}
                        onClick={() => !isPast && handleDateSelect(day)}
                      >
                        {day}
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Selected Date Display */}
              {meetingData.date && (
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="text-blue-600" size={16} />
                    <span className="font-medium text-blue-800">
                      Selected: {(() => {
                        const [year, month, day] = meetingData.date.split("-").map(Number)
                        const selectedDate = new Date(year, month - 1, day)
                        return selectedDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      })()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Time Selection */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FiClock className="mr-2 text-green-600" />
                Select Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {timeSlots.map((slot) => (
                  <motion.div key={slot.time} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant={meetingData.time === slot.time ? "default" : "outline"}
                      size="lg"
                      className={`w-full h-12 text-sm font-medium ${
                        meetingData.time === slot.time
                          ? "bg-green-600 hover:bg-green-700 text-white shadow-lg"
                          : "hover:bg-green-50 hover:border-green-300"
                      }`}
                      onClick={() => handleInputChange("time", slot.time)}
                    >
                      {slot.label}
                    </Button>
                  </motion.div>
                ))}
              </div>
              {/* Duration Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Meeting Duration</label>
                <Select value={meetingData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Meeting Location */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FiMapPin className="mr-2 text-orange-600" />
                Meeting Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={meetingData.location} onValueChange={(value) => handleInputChange("location", value)}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="office">Our Office</SelectItem>
                  <SelectItem value="client">Client Location</SelectItem>
                  <SelectItem value="site">Project Site</SelectItem>
                  <SelectItem value="custom">Custom Location</SelectItem>
                </SelectContent>
              </Select>
              {meetingData.location === "custom" && (
                <Input
                  placeholder="Enter meeting location"
                  value={meetingData.customLocation}
                  onChange={(e) => handleInputChange("customLocation", e.target.value)}
                  className="h-12"
                />
              )}
              {meetingData.location === "office" && (
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <FiMapPin className="text-orange-600" size={16} />
                    </div>
                    <div>
                      <h4 className="font-medium text-orange-800">Real Estate Office</h4>
                      <p className="text-sm text-orange-700 mt-1">
                        123 Business Park, Bangalore - 560001
                        <br />
                        Phone: +91 80 1234 5678
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {meetingData.location === "site" && (
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <FiMapPin className="text-green-600" size={16} />
                    </div>
                    <div className="flex-1">
                      {property?.loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm text-green-700">Loading project site details...</span>
                        </div>
                      ) : property?.error ? (
                        <div>
                          <h4 className="font-medium text-red-800">Project Site</h4>
                      
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-medium text-green-800">
                            {property?.title || `Project ${leadData?.ProjectCode}`}
                          </h4>
                          {property?.location ? (
                            <p className="text-sm text-green-700 mt-1">{property.location}</p>
                          ) : (
                            <p className="text-sm text-green-600 mt-1">Project Code: {leadData?.ProjectCode}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Meeting Details */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Meeting Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Meeting Agenda</label>
                <Textarea
                  placeholder="What will be discussed in this meeting?"
                  value={meetingData.agenda}
                  onChange={(e) => handleInputChange("agenda", e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Additional Attendees (Optional)</label>
                <Input
                  placeholder="Names of other attendees"
                  value={meetingData.attendees}
                  onChange={(e) => handleInputChange("attendees", e.target.value)}
                  className="h-12"
                />
              </div>
              {/* Image Upload Section */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">Reference Images (Optional)</label>
                <p className="text-xs text-gray-500 mb-3">
                  Add property photos, floor plans, or other reference materials
                </p>
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50">
                  <FiImage className="mx-auto text-gray-400 mb-3" size={32} />
                  <p className="text-sm text-gray-600 mb-3">Tap to add images</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("image-upload")?.click()}
                    className="h-10"
                  >
                    <FiUpload className="mr-2" size={16} />
                    Choose Images
                  </Button>
                </div>
                {/* Image Preview Grid */}
                {meetingImages.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Selected Images ({meetingImages.length})</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {meetingImages.map((image) => (
                        <motion.div
                          key={image.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative group"
                        >
                          <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200">
                            <img
                              src={image.preview || "/placeholder.svg"}
                              alt={image.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveImage(image.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiX size={12} />
                          </button>
                          {/* Image Name */}
                          <p className="text-xs text-gray-600 mt-1 truncate">{image.name}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Notes</label>
                <Textarea
                  placeholder="Any additional notes or preparation required"
                  value={meetingData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pb-4">
          <Button
            variant="outline"
            onClick={handleSendInvite}
            disabled={!meetingData.date || !meetingData.time || isSubmitting}
            className="h-12 font-medium bg-transparent"
          >
            SEND INVITE
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 h-12 font-medium"
            onClick={() => handleScheduleMeeting()}
            disabled={isSubmitting}
          >
            {isSubmitting ? "SCHEDULING..." : "SCHEDULE MEETING"}
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
