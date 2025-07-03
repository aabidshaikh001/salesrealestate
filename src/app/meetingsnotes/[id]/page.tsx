"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  FiList,
  FiPhone,
  FiMail,
  FiMapPin,
  FiEye,
  FiImage,
  FiX,
  FiCalendar,
  FiFileText,
  FiPlus,
  FiCamera,
  FiUser,
  FiClock,
  FiTarget,
  FiCheckSquare,
  FiArrowRight,
} from "react-icons/fi"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { useAuth } from "@/providers/auth-provider"

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

interface Property {
  PropertyId: string
  title: string
  location: string
  price: string
  pricePerSqft: string
  superBuiltUpArea: string
  bhkOptions: string[]
  images?: string[]
  PropertyType: string
}

interface MeetingNote {
  id: string
  MeetingDate: string
  MeetingTime: string
  attendees: string
  agenda: string
  notes: string
  actionItems: string
  nextSteps: string
  photos: string[]
  createdAt: string
  createdBy: string
}

interface MeetingImage {
  id: string
  file: File
  preview: string
  name: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.realestatecompany.co.in/api"

export default function MeetingNotesPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, token } = useAuth()
  const [leadData, setLeadData] = useState<LeadData | null>(null)
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [meetingImages, setMeetingImages] = useState<MeetingImage[]>([])
  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [selectedNoteImages, setSelectedNoteImages] = useState<string[]>([])

  // Form state
  const [formData, setFormData] = useState({
    meetingDate: new Date().toISOString().split("T")[0],
    meetingTime: new Date().toTimeString().slice(0, 5),
    attendees: "",
    agenda: "",
    notes: "",
    actionItems: "",
    nextSteps: "",
  })

  useEffect(() => {
    const fetchLeadData = async () => {
      if (!token) {
        toast.error("Authentication required")
        router.push("/login")
        return
      }

      try {
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
        toast.error("Failed to load lead data")
      } finally {
        setLoading(false)
      }
    }

    fetchLeadData()
  }, [params.id, token, router])

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

  const fetchMeetingHistory = async () => {
    if (!token) return

    setLoadingHistory(true)
    try {
      const response = await fetch(`${API_BASE_URL}/meeting-notes/lead/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch meeting history")
      }

      const data = await response.json()
      const formattedNotes: MeetingNote[] = (data.notes || []).map((note: any) => {
        // Convert file paths to proper URLs
        const photos = Array.isArray(note.Photos)
          ? note.Photos.map((photo: string) => {
              // If it's already a URL, return as is
              if (photo.startsWith("http")) {
                return photo
              }
              // If it's a file path, convert to URL
              const filename = photo.split("\\").pop() || photo.split("/").pop()
              return `${API_BASE_URL}/uploads/meeting-notes/${filename}`
            })
          : []

        return {
          id: String(note.NoteId),
          MeetingDate: note.MeetingDate,
          MeetingTime: note.MeetingTime,
          attendees: note.Attendees || "",
          agenda: note.Agenda || "",
          notes: note.Notes || "",
          actionItems: note.ActionItems || "",
          nextSteps: note.NextSteps || "",
          createdAt: note.CreatedAt,
          createdBy: note.CreatedBy || note.BrokerName || "Unknown",
          photos: photos,
        }
      })

      setMeetingNotes(formattedNotes)
    } catch (error) {
      console.error("Error fetching meeting history:", error)
      toast.error("Failed to load meeting history")
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files)
      // Validate file types
      const validImages = newImages.filter((image) => image.type.startsWith("image/"))
      if (validImages.length !== newImages.length) {
        toast.error("Only image files are allowed")
        return
      }

      // Validate file sizes (5MB limit)
      const oversizedImages = validImages.filter((image) => image.size > 5 * 1024 * 1024)
      if (oversizedImages.length > 0) {
        toast.error("Some files are too large. Maximum size is 5MB per image.")
        return
      }

      const imagePromises = validImages.map((file) => {
        return new Promise<MeetingImage>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            resolve({
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              file,
              preview: e.target?.result as string,
              name: file.name,
            })
          }
          reader.readAsDataURL(file)
        })
      })

      Promise.all(imagePromises).then((newMeetingImages) => {
        setMeetingImages((prev) => [...prev, ...newMeetingImages])
        toast.success(`${validImages.length} image(s) added`)
      })
    }
  }

  const removeImage = (imageId: string) => {
    setMeetingImages((prev) => prev.filter((img) => img.id !== imageId))
    toast.success("Image removed")
  }

  const handleSubmit = async () => {
    if (!formData.notes && !formData.agenda && meetingImages.length === 0) {
      toast.error("Please add meeting notes, agenda, or upload images")
      return
    }

    if (!user?.id || !token) {
      toast.error("Authentication required")
      return
    }

    try {
      setSubmitting(true)
      const submitFormData = new FormData()

      // Append form data
      Object.entries(formData).forEach(([key, value]) => {
        submitFormData.append(key, value)
      })

      // Append images
      meetingImages.forEach((image) => {
        submitFormData.append("images", image.file)
      })

      const response = await fetch(`${API_BASE_URL}/meeting-notes/${params.id}/${user.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitFormData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit meeting notes")
      }

      const result = await response.json()
      if (result.success) {
        toast.success("Meeting notes submitted successfully!")
        // Reset form
        setFormData({
          meetingDate: new Date().toISOString().split("T")[0],
          meetingTime: new Date().toTimeString().slice(0, 5),
          attendees: "",
          agenda: "",
          notes: "",
          actionItems: "",
          nextSteps: "",
        })
        setMeetingImages([])
        // Refresh history if modal is open
        if (showHistoryModal) {
          fetchMeetingHistory()
        }
      } else {
        throw new Error(result.message || "Failed to submit meeting notes")
      }
    } catch (error) {
      console.error("Error submitting meeting notes:", error)
      toast.error(error instanceof Error ? error.message : "Failed to submit meeting notes")
    } finally {
      setSubmitting(false)
    }
  }

  const formatDateTime = (date: string, time: string) => {
    const datePart = new Date(date).toISOString().split("T")[0]
    const dateObj = new Date(`${datePart}T${time}`)
    return dateObj.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const openImageViewer = (images: string[], index: number) => {
    setSelectedNoteImages(images)
    setSelectedImageIndex(index)
    // Close the drawer when opening image viewer to prevent stacking issues
    setShowHistoryModal(false)
  }

  const closeImageViewer = () => {
    setSelectedImageIndex(null)
    setSelectedNoteImages([])
  }

  const navigateImage = (direction: "prev" | "next") => {
    if (selectedImageIndex === null) return

    if (direction === "prev") {
      setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : selectedNoteImages.length - 1)
    } else {
      setSelectedImageIndex(selectedImageIndex < selectedNoteImages.length - 1 ? selectedImageIndex + 1 : 0)
    }
  }

  if (loading) {
    return (
      <AppLayout title="Meeting Notes" backUrl={`/lead-details/${params.id}`}>
        <div className="flex flex-col items-center justify-center h-64 bg-gradient-to-br from-blue-50 to-indigo-100 m-4 rounded-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading meeting notes...</p>
        </div>
      </AppLayout>
    )
  }

  if (!leadData) {
    return (
      <AppLayout title="Meeting Notes" backUrl={`/lead-details/${params.id}`}>
        <div className="p-6 text-center">
          <div className="bg-red-50 rounded-2xl p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiX className="text-red-600" size={24} />
            </div>
            <p className="text-gray-800 font-semibold mb-2">Failed to load lead information</p>
            <p className="text-gray-600 text-sm mb-6">Please try again or contact support</p>
            <Button
              className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6 py-3 font-semibold"
              onClick={() => router.push(`/lead-details/${params.id}`)}
            >
              Back to Lead Details
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Meeting Notes" backUrl={`/lead-details/${params.id}`}>
      <div className="bg-gray-50 min-h-screen">
        <div className="p-4 space-y-6">
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

          {/* Property Information */}
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
                      <p className="text-sm text-muted-foreground mt-1">{property.bhkOptions.join(", ")}</p>
                    )}
                    <p className="text-sm font-medium text-green-600 mt-1">
                      {property.price} ({property.pricePerSqft}/sq.ft)
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{property.superBuiltUpArea} (Super Built-up)</p>
                  </div>
                </div>

                {/* Preview Button */}
                <div className="pt-2">
                  <Button size="sm" variant="outline" onClick={() => router.push(`/property/${property.PropertyId}`)}>
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

          {/* Meeting Notes Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FiFileText className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Meeting Notes</h3>
                    <p className="text-gray-500 text-sm">Record your meeting details</p>
                  </div>
                </div>
                <Drawer open={showHistoryModal} onOpenChange={setShowHistoryModal}>
                  <DrawerTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchMeetingHistory}
                      className="rounded-xl border-gray-200 hover:bg-gray-50 font-semibold bg-transparent"
                    >
                      <FiList size={16} className="mr-2" />
                      History
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="max-h-[90vh] bg-white">
                    <DrawerHeader className="border-b border-gray-100 bg-gray-50">
                      <DrawerTitle className="flex items-center gap-3 text-lg font-bold">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FiFileText className="text-blue-600" size={16} />
                        </div>
                        Meeting History
                      </DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4 overflow-y-auto flex-1 bg-gray-50">
                      {loadingHistory ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
                          <p className="text-gray-600 font-medium">Loading history...</p>
                        </div>
                      ) : meetingNotes.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FiFileText className="text-gray-400" size={24} />
                          </div>
                          <p className="text-gray-600 font-semibold mb-2">No meeting notes yet</p>
                          <p className="text-gray-500 text-sm">Your meeting history will appear here</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {meetingNotes.map((note, index) => (
                            <motion.div
                              key={note.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
                                <CardContent className="p-6">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <FiCalendar className="text-blue-600" size={16} />
                                      </div>
                                      <div>
                                        <p className="font-bold text-gray-900 text-sm">
                                          {formatDateTime(note.MeetingDate, note.MeetingTime)}
                                        </p>
                                        <p className="text-gray-500 text-xs">Meeting #{index + 1}</p>
                                      </div>
                                    </div>
                                    {note.photos.length > 0 && (
                                      <Badge className="bg-green-100 text-green-700 border-green-200 font-semibold">
                                        <FiImage size={12} className="mr-1" />
                                        {note.photos.length}
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="space-y-4">
                                    {note.attendees && (
                                      <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mt-0.5">
                                          <FiUser className="text-purple-600" size={12} />
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-xs font-semibold text-gray-700 mb-1">ATTENDEES</p>
                                          <p className="text-sm text-gray-900">{note.attendees}</p>
                                        </div>
                                      </div>
                                    )}
                                    {note.agenda && (
                                      <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center mt-0.5">
                                          <FiTarget className="text-orange-600" size={12} />
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-xs font-semibold text-gray-700 mb-1">AGENDA</p>
                                          <p className="text-sm text-gray-900">{note.agenda}</p>
                                        </div>
                                      </div>
                                    )}
                                    {note.notes && (
                                      <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                                          <FiFileText className="text-blue-600" size={12} />
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-xs font-semibold text-gray-700 mb-1">NOTES</p>
                                          <p className="text-sm text-gray-900">{note.notes}</p>
                                        </div>
                                      </div>
                                    )}
                                    {note.actionItems && (
                                      <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center mt-0.5">
                                          <FiCheckSquare className="text-red-600" size={12} />
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-xs font-semibold text-gray-700 mb-1">ACTION ITEMS</p>
                                          <p className="text-sm text-gray-900">{note.actionItems}</p>
                                        </div>
                                      </div>
                                    )}
                                    {note.nextSteps && (
                                      <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mt-0.5">
                                          <FiArrowRight className="text-green-600" size={12} />
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-xs font-semibold text-gray-700 mb-1">NEXT STEPS</p>
                                          <p className="text-sm text-gray-900">{note.nextSteps}</p>
                                        </div>
                                      </div>
                                    )}
                                    {/* Display Images */}
                                    {note.photos.length > 0 && (
                                      <div className="pt-2">
                                        <p className="text-xs font-semibold text-gray-700 mb-3">IMAGES</p>
                                        <div className="grid grid-cols-3 gap-3">
                                          {note.photos.slice(0, 6).map((photo, photoIndex) => (
                                            <div
                                              key={photoIndex}
                                              className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200 shadow-sm"
                                              onClick={() => openImageViewer(note.photos, photoIndex)}
                                            >
                                              <img
                                                src={photo || "/placeholder.svg"}
                                                alt={`Meeting photo ${photoIndex + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                  e.currentTarget.src = "/placeholder.svg?height=100&width=100"
                                                }}
                                              />
                                              {photoIndex === 5 && note.photos.length > 6 && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                  <span className="text-white text-sm font-bold">
                                                    +{note.photos.length - 6}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                        <FiClock className="text-gray-500" size={10} />
                                      </div>
                                      <p className="text-xs text-gray-500">
                                        Added on {new Date(note.createdAt).toLocaleDateString()} by {note.createdBy}
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-3 block">Meeting Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.meetingDate}
                      onChange={(e) => handleInputChange("meetingDate", e.target.value)}
                      className="w-full h-14 px-4 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-3 block">Meeting Time</label>
                  <div className="relative">
                    <input
                      type="time"
                      value={formData.meetingTime}
                      onChange={(e) => handleInputChange("meetingTime", e.target.value)}
                      className="w-full h-14 px-4 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Attendees */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-3 block">Attendees</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FiUser className="text-gray-400" size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Names of meeting attendees"
                    value={formData.attendees}
                    onChange={(e) => handleInputChange("attendees", e.target.value)}
                    className="w-full h-14 pl-12 pr-4 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Agenda */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-3 block">Meeting Agenda</label>
                <Textarea
                  placeholder="What was discussed in this meeting?"
                  value={formData.agenda}
                  onChange={(e) => handleInputChange("agenda", e.target.value)}
                  rows={3}
                  className="resize-none bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium placeholder-gray-400 p-4"
                />
              </div>

              {/* Meeting Notes */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-3 block">Meeting Notes</label>
                <Textarea
                  placeholder="Detailed notes from the meeting..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={5}
                  className="resize-none bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium placeholder-gray-400 p-4"
                />
              </div>

              {/* Action Items */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-3 block">Action Items</label>
                <Textarea
                  placeholder="Tasks and action items from the meeting..."
                  value={formData.actionItems}
                  onChange={(e) => handleInputChange("actionItems", e.target.value)}
                  rows={3}
                  className="resize-none bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium placeholder-gray-400 p-4"
                />
              </div>

              {/* Next Steps */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-3 block">Next Steps</label>
                <Textarea
                  placeholder="What are the next steps and follow-ups?"
                  value={formData.nextSteps}
                  onChange={(e) => handleInputChange("nextSteps", e.target.value)}
                  rows={3}
                  className="resize-none bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium placeholder-gray-400 p-4"
                />
              </div>

              {/* Image Upload */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-gray-700">Reference Images</label>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-semibold">
                    {meetingImages.length}/10
                  </Badge>
                </div>
                <AnimatePresence>
                  {meetingImages.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-3 gap-3 mb-4"
                    >
                      {meetingImages.map((image, index) => (
                        <motion.div
                          key={image.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm"
                        >
                          <img
                            src={image.preview || "/placeholder.svg"}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removeImage(image.id)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg"
                          >
                            <FiX size={14} />
                          </button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  variant="outline"
                  className="w-full h-14 flex items-center justify-center gap-3 bg-gray-50 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-xl transition-all font-semibold text-gray-600 hover:text-blue-600"
                  onClick={() => document.getElementById("image-upload")?.click()}
                  disabled={meetingImages.length >= 10}
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiCamera className="text-blue-600" size={16} />
                  </div>
                  {meetingImages.length >= 10 ? "Maximum Images Reached" : "Add Images"}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Maximum 10 images, 5MB each. JPG, PNG, GIF supported
                </p>
              </div>

              {/* Submit Button */}
              <motion.div whileTap={{ scale: 0.98 }} className="pt-4">
                <Button
                  className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <FiPlus size={20} />
                      Save Meeting Notes
                    </div>
                  )}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Image Viewer Modal - Fixed z-index and positioning */}
        <AnimatePresence>
          {selectedImageIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999]"
              style={{ zIndex: 9999 }}
            >
              <div className="relative w-full h-full flex items-center justify-center p-4">
                <button
                  onClick={closeImageViewer}
                  className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-white/30 transition-colors z-10"
                >
                  <FiX size={24} />
                </button>

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative max-w-4xl max-h-full"
                >
                  <img
                    src={selectedNoteImages[selectedImageIndex] || "/placeholder.svg"}
                    alt={`Image ${selectedImageIndex + 1}`}
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=400&width=400"
                    }}
                  />

                  {selectedNoteImages.length > 1 && (
                    <>
                      <button
                        onClick={() => navigateImage("prev")}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white rounded-full w-14 h-14 flex items-center justify-center hover:bg-white/30 transition-colors text-xl font-bold"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => navigateImage("next")}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white rounded-full w-14 h-14 flex items-center justify-center hover:bg-white/30 transition-colors text-xl font-bold"
                      >
                        →
                      </button>
                    </>
                  )}
                </motion.div>

                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full font-semibold">
                  {selectedImageIndex + 1} of {selectedNoteImages.length}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
