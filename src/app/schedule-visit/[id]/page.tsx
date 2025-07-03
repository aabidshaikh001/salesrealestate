"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { FiMapPin, FiChevronRight, FiCalendar, FiClock, FiChevronLeft, FiVideo, FiHome, FiList,FiEye } from "react-icons/fi"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FiPhone, FiMail } from "react-icons/fi"
import { BsBuildingsFill } from "react-icons/bs"
import { useAuth } from "@/providers/auth-provider"
import SiteVisitHistoryModal from "../../component/site-visit-history-modal"



const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.realestatecompany.co.in/api"

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
interface Property{
 PropertyId: string
  title: string
  location: string
  price: string
  pricePerSqft: string
  superBuiltUpArea: string
  bhkOptions?: string[]
  images?: string[]

}


export default function ScheduleVisitPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, token } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [visitData, setVisitData] = useState({
    date: "",
    timeSlot: "",
    mode: "",
    transportation: "",
  })
  const [leadData, setLeadData] = useState<LeadData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  

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
    { value: "09:00-10:00", label: "9:00 AM - 10:00 AM" },
    { value: "10:00-11:00", label: "10:00 AM - 11:00 AM" },
    { value: "11:00-12:00", label: "11:00 AM - 12:00 PM" },
    { value: "12:00-13:00", label: "12:00 PM - 1:00 PM" },
    { value: "14:00-15:00", label: "2:00 PM - 3:00 PM" },
    { value: "15:00-16:00", label: "3:00 PM - 4:00 PM" },
    { value: "16:00-17:00", label: "4:00 PM - 5:00 PM" },
    { value: "17:00-18:00", label: "5:00 PM - 6:00 PM" },
  ]

  const visitModes = [
    { value: "physical", label: "Physical Visit", icon: FiHome, description: "In-person site visit" },
    { value: "virtual", label: "Virtual Tour", icon: FiVideo, description: "Online property tour" },
    { value: "hybrid", label: "Hybrid Visit", icon: FiCalendar, description: "Physical + Virtual tour" },
  ]

  const transportationOptions = [
    { value: "own_vehicle", label: "Own Vehicle" },
    { value: "company_vehicle", label: "Company Vehicle" },
    { value: "public_transport", label: "Public Transport" },
    { value: "taxi_uber", label: "Taxi/Uber" },
    { value: "client_pickup", label: "Client Pickup" },
  ]

  // Fetch lead data from API
  useEffect(() => {
    const fetchLeadData = async () => {
      if (!token || !user?.id) {
        toast.error("Authentication required")
        router.push("/login")
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`${API_BASE_URL}/propertylead/byleadid/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch lead data")
        }

        const data = await response.json()
        setLeadData(data)
      } catch (error) {
        console.error("Error fetching lead data:", error)
        toast.error("Failed to load lead information")
      } finally {
        setLoading(false)
      }
    }

    fetchLeadData()
  }, [params.id, token, user?.id, router])

  const [property, setProperty] = useState<Property | null>(null)
   useEffect(() => {
  const fetchProperty = async () => {
    if (!leadData?.ProjectCode) return

    try {
      const response = await fetch(`https://api.realestatecompany.co.in/api/properties/${leadData.ProjectCode}`)
      if (!response.ok) throw new Error("Failed to fetch property")
      const data = await response.json()
      setProperty(data)
    } catch (error) {
      console.error("Error fetching property:", error)
      toast.error("Failed to load property")
    }
  }

  fetchProperty()
}, [leadData?.ProjectCode])

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

    setVisitData({
      ...visitData,
      date: date.toISOString().split("T")[0],
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setVisitData({
      ...visitData,
      [field]: value,
    })
  }

  const isDatePast = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const handleSave = async () => {
    if (!visitData.date || !visitData.timeSlot || !visitData.mode) {
      toast.error("Please fill in all required fields (Date, Time Slot, Mode)")
      return
    }

    if ((visitData.mode === "physical" || visitData.mode === "hybrid") && !visitData.transportation) {
      toast.error("Please select transportation method")
      return
    }

    if (!user?.id || !token) {
      toast.error("Authentication required")
      return
    }

    try {
      setSubmitting(true)

      const scheduleData = {
        leadId: Number.parseInt(params.id),
        visitDate: visitData.date,
        timeSlot: visitData.timeSlot,
        visitMode: visitData.mode,
        transportation: visitData.transportation || null,
      }

      const response = await fetch(`${API_BASE_URL}/site-visits/${user.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scheduleData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to schedule site visit")
      }

      const result = await response.json()

      if (result.success) {
        toast.success("Site visit scheduled successfully!")
        router.push(`/site-visit-feedback/${result.visitId}`)
      } else {
        throw new Error(result.message || "Failed to schedule site visit")
      }
    } catch (error) {
      console.error("Error scheduling site visit:", error)
      toast.error(error instanceof Error ? error.message : "Failed to schedule site visit")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <AppLayout title="Schedule Site Visit" backUrl={`/lead-details/${params.id}`}>
        <div className="p-4 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    )
  }

  if (!leadData) {
    return (
      <AppLayout title="Schedule Site Visit" backUrl={`/lead-details/${params.id}`}>
        <div className="p-4 text-center py-8">
          <p>Failed to load lead information</p>
          <Button className="mt-4" onClick={() => router.push(`/lead-details/${params.id}`)}>
            Back to Lead Details
          </Button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Schedule Site Visit" backUrl={`/lead-details/${params.id}`}>
      <div className="p-4 space-y-4">
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
                  {Array.isArray(property.bhkOptions) && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {property.bhkOptions.join(", ")}
                    </p>
                  )}
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
        

        {/* Date Selection */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center">
                <FiCalendar className="mr-2 text-blue-600" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    const dateString = date.toISOString().split("T")[0]
                    const isSelected = dateString === visitData.date
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
              {visitData.date && (
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="text-blue-600" size={16} />
                    <span className="font-medium text-blue-800">
                      Selected:{" "}
                      {new Date(visitData.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Time Slot Selection */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FiClock className="mr-2 text-green-600" />
                Select Time Slot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={visitData.timeSlot} onValueChange={(value) => handleInputChange("timeSlot", value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Choose a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </motion.div>

        {/* Visit Mode Selection */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FiVideo className="mr-2 text-orange-600" />
                Visit Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {visitModes.map((mode) => (
                <motion.div key={mode.value} whileTap={{ scale: 0.98 }}>
                  <div
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      visitData.mode === mode.value
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                    onClick={() => handleInputChange("mode", mode.value)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          visitData.mode === mode.value ? "bg-orange-100" : "bg-gray-100"
                        }`}
                      >
                        <mode.icon
                          className={visitData.mode === mode.value ? "text-orange-600" : "text-gray-600"}
                          size={20}
                        />
                      </div>
                      <div className="flex-1">
                        <span
                          className={`font-medium block ${
                            visitData.mode === mode.value ? "text-orange-800" : "text-gray-700"
                          }`}
                        >
                          {mode.label}
                        </span>
                        <span className="text-sm text-gray-500">{mode.description}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Transportation (only show for physical visits) */}
        {(visitData.mode === "physical" || visitData.mode === "hybrid") && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FiMapPin className="mr-2 text-purple-600" />
                  Transportation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={visitData.transportation}
                  onValueChange={(value) => handleInputChange("transportation", value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select transportation method" />
                  </SelectTrigger>
                  <SelectContent>
                    {transportationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Save Button */}
        <div className="pb-4">
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700 h-12 font-medium"
            onClick={handleSave}
            disabled={submitting}
          >
            {submitting ? "SCHEDULING..." : "SCHEDULE VISIT"}
          </Button>
        </div>

        {/* Visit History Button */}
        <div className="pb-2">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => setShowHistoryModal(true)}
          >
            <FiList className="mr-2" size={16} />
            View Visit History
          </Button>
        </div>

        {/* Site Visit History Modal */}
        <SiteVisitHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          leadId={params.id}
          leadName={leadData?.Name}
        />
      </div>
    </AppLayout>
  )
}
