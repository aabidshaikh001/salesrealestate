"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { FiX, FiCalendar, FiMessageSquare, FiImage, FiRefreshCw, FiTrash2, FiEye, FiDownload } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/providers/auth-provider"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.realestatecompany.co.in/api"

interface SiteVisitFeedback {
  FeedbackId: number
  LeadId: number
  BrokerId: string
  VisitDate: string
  Remarks: string
  Status: string
  CreatedAt: string
  UpdatedAt: string
  Photos: string[]
  BrokerName: string
  BrokerEmail: string
  BrokerPhone: string
}

interface SiteVisitFeedbackHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  leadId: string
  leadName?: string
}

export default function SiteVisitFeedbackHistoryModal({
  isOpen,
  onClose,
  leadId,
  leadName,
}: SiteVisitFeedbackHistoryModalProps) {
  const { user, token } = useAuth()
  const [feedbacks, setFeedbacks] = useState<SiteVisitFeedback[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<SiteVisitFeedback | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Fetch feedbacks when modal opens
  useEffect(() => {
    if (isOpen && leadId && token) {
      fetchFeedbacksByLeadId()
    }
  }, [isOpen, leadId, token])

  const fetchFeedbacksByLeadId = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/site-visit-feedback/lead/${leadId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch feedback history")
      }

      const data = await response.json()
      if (data.success) {
        setFeedbacks(data.feedbacks || [])
      } else {
        throw new Error(data.message || "Failed to fetch feedback history")
      }
    } catch (error) {
      console.error("Error fetching feedback history:", error)
      toast.error("Failed to load feedback history")
    } finally {
      setLoading(false)
    }
  }

  const fetchFeedbackById = async (feedbackId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/site-visit-feedback/${feedbackId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch feedback details")
      }

      const data = await response.json()
      if (data.success) {
        setSelectedFeedback(data.feedback)
      } else {
        throw new Error(data.message || "Failed to fetch feedback details")
      }
    } catch (error) {
      console.error("Error fetching feedback details:", error)
      toast.error("Failed to load feedback details")
    }
  }

  const deleteFeedback = async (feedbackId: number) => {
    if (!user?.id || !token) {
      toast.error("Authentication required")
      return
    }

    try {
      setDeleting(true)
      const response = await fetch(`${API_BASE_URL}/site-visit-feedback/${feedbackId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete feedback")
      }

      const data = await response.json()
      if (data.success) {
        toast.success("Feedback deleted successfully")
        setShowDeleteConfirm(null)
        setSelectedFeedback(null)
        // Refresh the feedbacks list
        fetchFeedbacksByLeadId()
      } else {
        throw new Error(data.message || "Failed to delete feedback")
      }
    } catch (error) {
      console.error("Error deleting feedback:", error)
      toast.error("Failed to delete feedback")
    } finally {
      setDeleting(false)
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "submitted":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "reviewed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
              <h2 className="text-lg font-semibold">Feedback History</h2>
              {leadName && <p className="text-sm text-muted-foreground">{leadName}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={fetchFeedbacksByLeadId} disabled={loading}>
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
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-8">
                <FiMessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">No feedback found</p>
                <p className="text-sm text-gray-400">Site visit feedback will appear here</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {feedbacks.map((feedback) => (
                  <Card key={feedback.FeedbackId} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FiCalendar size={16} className="text-gray-500" />
                          <span className="font-medium">{formatDate(feedback.VisitDate)}</span>
                        </div>
                        <Badge className={getStatusColor(feedback.Status)}>{feedback.Status}</Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">{feedback.BrokerName?.charAt(0) || "B"}</AvatarFallback>
                          </Avatar>
                          <span>{feedback.BrokerName}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-500">{formatTime(feedback.CreatedAt)}</span>
                        </div>

                        {feedback.Remarks && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600">{feedback.Remarks}</p>
                          </div>
                        )}

                        {feedback.Photos && feedback.Photos.length > 0 && (
                          <div className="flex items-center gap-2">
                            <FiImage size={14} className="text-gray-500" />
                            <span className="text-gray-600">{feedback.Photos.length} photo(s)</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={() => fetchFeedbackById(feedback.FeedbackId)}>
                          <FiEye size={14} className="mr-1" />
                          View Details
                        </Button>
                        
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Feedback Details Modal */}
        {selectedFeedback && !showDeleteConfirm && selectedImageIndex === null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSelectedFeedback(null)}
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
                  <h3 className="text-lg font-semibold">Feedback Details</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedFeedback(null)}>
                    <FiX size={20} />
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status</span>
                  <Badge className={getStatusColor(selectedFeedback.Status)}>{selectedFeedback.Status}</Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FiCalendar className="text-gray-500" size={16} />
                    <div>
                      <p className="font-medium">Visit Date</p>
                      <p className="text-sm text-gray-600">{formatDate(selectedFeedback.VisitDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {selectedFeedback.BrokerName?.charAt(0) || "B"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">Broker</p>
                      <p className="text-sm text-gray-600">{selectedFeedback.BrokerName}</p>
                      {selectedFeedback.BrokerEmail && (
                        <p className="text-xs text-gray-500">{selectedFeedback.BrokerEmail}</p>
                      )}
                    </div>
                  </div>
                </div>

                {selectedFeedback.Remarks && (
                  <div className="border-t pt-4">
                    <p className="font-medium mb-2">Remarks</p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">{selectedFeedback.Remarks}</p>
                    </div>
                  </div>
                )}

                {selectedFeedback.Photos && selectedFeedback.Photos.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="font-medium mb-2">Photos ({selectedFeedback.Photos.length})</p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedFeedback.Photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photo || "/placeholder.svg"}
                            alt={`Feedback ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setSelectedImageIndex(index)}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                            <FiEye
                              className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              size={20}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-1 right-1 bg-white/80 hover:bg-white p-1 h-auto"
                            onClick={(e) => {
                              e.stopPropagation()
                              downloadImage(photo, `feedback-${selectedFeedback.FeedbackId}-${index + 1}.jpg`)
                            }}
                          >
                            <FiDownload size={12} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4 text-xs text-gray-500">
                  <p>Submitted: {new Date(selectedFeedback.CreatedAt).toLocaleString()}</p>
                  <p>Updated: {new Date(selectedFeedback.UpdatedAt).toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Image Viewer Modal */}
        {selectedFeedback && selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-70 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelectedImageIndex(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedFeedback.Photos[selectedImageIndex] || "/placeholder.svg"}
                alt={`Feedback ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white"
                  onClick={() =>
                    downloadImage(
                      selectedFeedback.Photos[selectedImageIndex],
                      `feedback-${selectedFeedback.FeedbackId}-${selectedImageIndex + 1}.jpg`,
                    )
                  }
                >
                  <FiDownload size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white"
                  onClick={() => setSelectedImageIndex(null)}
                >
                  <FiX size={20} />
                </Button>
              </div>
              {selectedFeedback.Photos.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white"
                    onClick={() =>
                      setSelectedImageIndex(
                        selectedImageIndex > 0 ? selectedImageIndex - 1 : selectedFeedback.Photos.length - 1,
                      )
                    }
                  >
                    Previous
                  </Button>
                  <span className="bg-white/20 text-white px-3 py-1 rounded text-sm">
                    {selectedImageIndex + 1} / {selectedFeedback.Photos.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white"
                    onClick={() =>
                      setSelectedImageIndex(
                        selectedImageIndex < selectedFeedback.Photos.length - 1 ? selectedImageIndex + 1 : 0,
                      )
                    }
                  >
                    Next
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-red-600">Delete Feedback</h3>
                <p className="text-sm text-gray-600">Are you sure you want to delete this feedback?</p>
              </div>

              <div className="p-4 space-y-4">
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-800">
                    This action cannot be undone. All photos and remarks will be permanently deleted.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setShowDeleteConfirm(null)}
                    disabled={deleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => deleteFeedback(showDeleteConfirm)}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Delete"}
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
