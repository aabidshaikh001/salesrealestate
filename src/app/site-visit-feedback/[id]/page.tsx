"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { FiUpload, FiList } from "react-icons/fi"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FiPhone, FiMail } from "react-icons/fi"
import { FiMapPin, FiEye } from "react-icons/fi"

import { BsBuildingsFill } from "react-icons/bs"
import { useAuth } from "@/providers/auth-provider"
import SiteVisitFeedbackHistoryModal from "../../component/site-visit-feedback-history-modal"

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
  bhkOptions: string[]
  images?: string[]
  PropertyType: string
  
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.realestatecompany.co.in/api"

export default function SiteVisitFeedbackPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, token } = useAuth()
  const [remarks, setRemarks] = useState("")
  const [photos, setPhotos] = useState<File[]>([])
  const [leadData, setLeadData] = useState<LeadData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)

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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos = Array.from(e.target.files)
      
      // Validate file types
      const validPhotos = newPhotos.filter(photo => photo.type.startsWith('image/'))
      if (validPhotos.length !== newPhotos.length) {
        toast.error("Only image files are allowed")
        return
      }

      // Validate file sizes (5MB limit)
      const oversizedPhotos = validPhotos.filter(photo => photo.size > 5 * 1024 * 1024)
      if (oversizedPhotos.length > 0) {
        toast.error("Some files are too large. Maximum size is 5MB per image.")
        return
      }

      setPhotos([...photos, ...validPhotos])
      toast.success(`${validPhotos.length} photo(s) added`)
    }
  }

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    setPhotos(newPhotos)
    toast.success("Photo removed")
  }

  const handleSubmit = async () => {
    if (!remarks && photos.length === 0) {
      toast.error("Please add remarks or upload photos")
      return
    }

    if (!user?.id || !token) {
      toast.error("Authentication required")
      return
    }

    try {
      setSubmitting(true)

      const formData = new FormData()
      formData.append("remarks", remarks)
      formData.append("visitDate", new Date().toISOString())

      // Append photos
      photos.forEach((photo, index) => {
        formData.append("photos", photo)
      })

      const response = await fetch(`${API_BASE_URL}/site-visit-feedback/${params.id}/${user.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit feedback")
      }

      const result = await response.json()

      if (result.success) {
        toast.success("Site visit feedback submitted successfully!")
        router.push(`/commercial-discussion/${params.id}`)
      } else {
        throw new Error(result.message || "Failed to submit feedback")
      }
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast.error(error instanceof Error ? error.message : "Failed to submit feedback")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <AppLayout title="Site Visit Feedback" backUrl={`/lead-details/${params.id}`}>
        <div className="p-4 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    )
  }

  if (!leadData) {
    return (
      <AppLayout title="Site Visit Feedback" backUrl={`/lead-details/${params.id}`}>
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
    <AppLayout title="Site Visit Feedback" backUrl={`/lead-details/${params.id}`}>
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
              
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Photos ({photos.length}/10)</p>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square bg-muted rounded-md overflow-hidden">
                    <img
                      src={URL.createObjectURL(photo) || "/placeholder.svg"}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => document.getElementById("photo-upload")?.click()}
              disabled={photos.length >= 10}
            >
              <FiUpload />
              {photos.length >= 10 ? "MAXIMUM PHOTOS REACHED" : "UPLOAD PHOTOS"}
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </Button>
            <p className="text-xs text-muted-foreground">
              Maximum 10 photos, 5MB each. Supported formats: JPG, PNG, GIF
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Remarks</label>
            <Textarea
              placeholder="Add your feedback about the site visit..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={5}
            />
          </div>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "SUBMITTING..." : "SUBMIT"}
          </Button>

          {/* View History Button */}
          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={() => setShowHistoryModal(true)}
          >
            <FiList className="mr-2" size={16} />
            View Feedback History
          </Button>
        </motion.div>

        {/* Site Visit Feedback History Modal */}
        <SiteVisitFeedbackHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          leadId={params.id}
          leadName={leadData?.Name}
        />
      </div>
    </AppLayout>
  )
}
