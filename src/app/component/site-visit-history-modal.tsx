"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  FiX,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiVideo,
  FiHome,
  FiUser,
  FiTrash2,
  FiEye,
  FiRefreshCw,
} from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/providers/auth-provider"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.realestatecompany.co.in/api"

interface SiteVisit {
  VisitId: string
  LeadId: number
  BrokerId: string
  VisitDate: string
  TimeSlot: string
  VisitMode: string
  Transportation?: string
  Status: string
  FeedbackNotes?: string
  FeedbackImages?: string
  CreatedAt: string
  UpdatedAt: string
  LeadName?: string
  LeadMobile?: string
  LeadEmail?: string
  LeadCode?: string
  BrokerName?: string
  BrokerEmail?: string
}

interface SiteVisitHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  leadId: string
  leadName?: string
}

export default function SiteVisitHistoryModal({ isOpen, onClose, leadId, leadName }: SiteVisitHistoryModalProps) {
  const { user, token } = useAuth()
  const [visits, setVisits] = useState<SiteVisit[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedVisit, setSelectedVisit] = useState<SiteVisit | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancellationReason, setCancellationReason] = useState("")
  const [cancelling, setCancelling] = useState(false)

  // Fetch visits when modal opens
  useEffect(() => {
    if (isOpen && leadId && user?.id && token) {
      fetchVisitsByLeadId()
    }
  }, [isOpen, leadId, user?.id, token])

  const fetchVisitsByLeadId = async () => {
    if (!user?.id || !token) {
      toast.error("Authentication required")
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/site-visits/${user.id}/lead/${leadId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch visit history")
      }

      const data = await response.json()
      if (data.success) {
        setVisits(data.visits || [])
      } else {
        throw new Error(data.message || "Failed to fetch visit history")
      }
    } catch (error) {
      console.error("Error fetching visit history:", error)
      toast.error("Failed to load visit history")
    } finally {
      setLoading(false)
    }
  }

  const fetchVisitById = async (visitId: string) => {
    if (!user?.id || !token) {
      toast.error("Authentication required")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/site-visits/${user.id}/${visitId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch visit details")
      }

      const data = await response.json()
      if (data.success) {
        setSelectedVisit(data.visit)
      } else {
        throw new Error(data.message || "Failed to fetch visit details")
      }
    } catch (error) {
      console.error("Error fetching visit details:", error)
      toast.error("Failed to load visit details")
    }
  }

  const cancelVisit = async (visitId: string) => {
    if (!user?.id || !token) {
      toast.error("Authentication required")
      return
    }

    try {
      setCancelling(true)
      const response = await fetch(`${API_BASE_URL}/site-visits/${user.id}/${visitId}/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cancellationReason: cancellationReason || "No reason provided",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to cancel visit")
      }

      const data = await response.json()
      if (data.success) {
        toast.success("Visit cancelled successfully")
        setShowCancelModal(false)
        setCancellationReason("")
        setSelectedVisit(null)
        // Refresh the visits list
        fetchVisitsByLeadId()
      } else {
        throw new Error(data.message || "Failed to cancel visit")
      }
    } catch (error) {
      console.error("Error cancelling visit:", error)
      toast.error("Failed to cancel visit")
    } finally {
      setCancelling(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getVisitModeIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case "physical":
        return <FiHome size={16} />
      case "virtual":
        return <FiVideo size={16} />
      case "hybrid":
        return <FiCalendar size={16} />
      default:
        return <FiMapPin size={16} />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeSlot: string) => {
    return timeSlot.replace("-", " - ")
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 500 }}
          className="w-full max-w-lg bg-white rounded-t-3xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h2 className="text-lg font-semibold">Site Visit History</h2>
              {leadName && <p className="text-sm text-muted-foreground">{leadName}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={fetchVisitsByLeadId} disabled={loading}>
                <FiRefreshCw className={`${loading ? "animate-spin" : ""}`} size={16} />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <FiX size={20} />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : visits.length === 0 ? (
              <div className="text-center py-8">
                <FiCalendar className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">No site visits found</p>
                <p className="text-sm text-gray-400">Schedule your first visit to see it here</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {visits.map((visit) => (
                  <Card key={visit.VisitId} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getVisitModeIcon(visit.VisitMode)}
                          <span className="font-medium capitalize">{visit.VisitMode} Visit</span>
                        </div>
                        <Badge className={getStatusColor(visit.Status)}>{visit.Status}</Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <FiCalendar size={14} className="text-gray-500" />
                          <span>{formatDate(visit.VisitDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiClock size={14} className="text-gray-500" />
                          <span>{formatTime(visit.TimeSlot)}</span>
                        </div>
                        {visit.Transportation && (
                          <div className="flex items-center gap-2">
                            <FiMapPin size={14} className="text-gray-500" />
                            <span className="capitalize">{visit.Transportation.replace("_", " ")}</span>
                          </div>
                        )}
                        {visit.BrokerName && (
                          <div className="flex items-center gap-2">
                            <FiUser size={14} className="text-gray-500" />
                            <span>{visit.BrokerName}</span>
                          </div>
                        )}
                      </div>

                      {visit.FeedbackNotes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium mb-1">Feedback:</p>
                          <p className="text-sm text-gray-600">{visit.FeedbackNotes}</p>
                        </div>
                      )}

                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={() => fetchVisitById(visit.VisitId)}>
                          <FiEye size={14} className="mr-1" />
                          View Details
                        </Button>
                        {visit.Status.toLowerCase() === "scheduled" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedVisit(visit)
                              setShowCancelModal(true)
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FiTrash2 size={14} className="mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Visit Details Modal */}
        {selectedVisit && !showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSelectedVisit(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Visit Details</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedVisit(null)}>
                    <FiX size={20} />
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status</span>
                  <Badge className={getStatusColor(selectedVisit.Status)}>{selectedVisit.Status}</Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FiCalendar className="text-gray-500" size={16} />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-sm text-gray-600">{formatDate(selectedVisit.VisitDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FiClock className="text-gray-500" size={16} />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-sm text-gray-600">{formatTime(selectedVisit.TimeSlot)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getVisitModeIcon(selectedVisit.VisitMode)}
                    <div>
                      <p className="font-medium">Visit Mode</p>
                      <p className="text-sm text-gray-600 capitalize">{selectedVisit.VisitMode}</p>
                    </div>
                  </div>

                  {selectedVisit.Transportation && (
                    <div className="flex items-center gap-3">
                      <FiMapPin className="text-gray-500" size={16} />
                      <div>
                        <p className="font-medium">Transportation</p>
                        <p className="text-sm text-gray-600 capitalize">
                          {selectedVisit.Transportation.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedVisit.BrokerName && (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">{selectedVisit.BrokerName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Broker</p>
                        <p className="text-sm text-gray-600">{selectedVisit.BrokerName}</p>
                        {selectedVisit.BrokerEmail && (
                          <p className="text-xs text-gray-500">{selectedVisit.BrokerEmail}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {selectedVisit.FeedbackNotes && (
                  <div className="border-t pt-4">
                    <p className="font-medium mb-2">Feedback</p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">{selectedVisit.FeedbackNotes}</p>
                    </div>
                  </div>
                )}

                {selectedVisit.FeedbackImages && (
                  <div className="border-t pt-4">
                    <p className="font-medium mb-2">Images</p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedVisit.FeedbackImages.split(",").map((image, index) => (
                        <img
                          key={index}
                          src={image.trim() || "/placeholder.svg"}
                          alt={`Feedback ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4 text-xs text-gray-500">
                  <p>Created: {new Date(selectedVisit.CreatedAt).toLocaleString()}</p>
                  <p>Updated: {new Date(selectedVisit.UpdatedAt).toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cancel Visit Modal */}
        {showCancelModal && selectedVisit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-red-600">Cancel Visit</h3>
                <p className="text-sm text-gray-600">Are you sure you want to cancel this visit?</p>
              </div>

              <div className="p-4 space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium">{formatDate(selectedVisit.VisitDate)}</p>
                  <p className="text-sm text-gray-600">{formatTime(selectedVisit.TimeSlot)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Cancellation Reason (Optional)</label>
                  <Textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="Please provide a reason for cancellation..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setShowCancelModal(false)}
                    disabled={cancelling}
                  >
                    Keep Visit
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => cancelVisit(selectedVisit.VisitId)}
                    disabled={cancelling}
                  >
                    {cancelling ? "Cancelling..." : "Cancel Visit"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  )
}
