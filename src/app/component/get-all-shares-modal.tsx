"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  FiX,
  FiMail,
  FiMessageSquare,
  FiPhone,
  FiEye,
  FiDownload,
  FiCalendar,
  FiUser,
  FiShare2,
  FiFile,
} from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/providers/auth-provider"

interface ShareDocument {
  id: string
  name: string
  type: string
  size: string
  path: string
}

interface ShareData {
  ShareId: string
  LeadId: number
  SharedBy: string
  SharedTo: string
  ShareMethod: "email" | "whatsapp" | "sms"
  Message: string
  IsViewed: boolean
  ViewedAt: string | null
  CreatedAt: string
  SharedByName: string
  LeadName: string
  Documents: ShareDocument[]
}

interface GetAllSharesModalProps {
  isOpen: boolean
  onClose: () => void
  leadId: string
  leadName?: string
}

export default function GetAllSharesModal({ isOpen, onClose, leadId, leadName }: GetAllSharesModalProps) {
  const { token } = useAuth()
  const [shares, setShares] = useState<ShareData[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedShare, setSelectedShare] = useState<ShareData | null>(null)

  useEffect(() => {
    if (isOpen && leadId) {
      fetchShares()
    }
  }, [isOpen, leadId])

  const fetchShares = async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://api.realestatecompany.co.in/api/leads/${leadId}/shares`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch shares")
      }

      const data = await response.json()
      setShares(data.data || [])
    } catch (error) {
      console.error("Error fetching shares:", error)
      toast.error("Failed to load shares")
    } finally {
      setLoading(false)
    }
  }

  const getShareMethodIcon = (method: string) => {
    switch (method) {
      case "email":
        return <FiMail className="text-blue-600" size={16} />
      case "whatsapp":
        return <FiMessageSquare className="text-green-600" size={16} />
      case "sms":
        return <FiPhone className="text-purple-600" size={16} />
      default:
        return <FiShare2 className="text-gray-600" size={16} />
    }
  }

  const getShareMethodColor = (method: string) => {
    switch (method) {
      case "email":
        return "bg-blue-100 text-blue-800"
      case "whatsapp":
        return "bg-green-100 text-green-800"
      case "sms":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleDownloadDocument = async (docPath: string, docName: string) => {
    try {
      const response = await fetch(`https://api.realestatecompany.co.in${docPath}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to download document")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = docName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Document downloaded successfully")
    } catch (error) {
      console.error("Error downloading document:", error)
      toast.error("Failed to download document")
    }
  }

  const ShareDetailView = ({ share }: { share: ShareData }) => (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      className="absolute inset-0 bg-white z-10 overflow-y-auto"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Share Details</h3>
          <Button variant="ghost" size="sm" onClick={() => setSelectedShare(null)}>
            <FiX size={20} />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Share Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getShareMethodIcon(share.ShareMethod)}
                  <Badge className={getShareMethodColor(share.ShareMethod)}>{share.ShareMethod.toUpperCase()}</Badge>
                </div>
                <Badge variant={share.IsViewed ? "default" : "secondary"}>
                  {share.IsViewed ? "Viewed" : "Not Viewed"}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FiUser size={14} className="text-gray-500" />
                  <span className="text-sm">
                    <strong>Shared by:</strong> {share.SharedByName}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiShare2 size={14} className="text-gray-500" />
                  <span className="text-sm">
                    <strong>Shared to:</strong> {share.SharedTo}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiCalendar size={14} className="text-gray-500" />
                  <span className="text-sm">
                    <strong>Shared on:</strong> {formatDate(share.CreatedAt)}
                  </span>
                </div>
                {share.IsViewed && share.ViewedAt && (
                  <div className="flex items-center space-x-2">
                    <FiEye size={14} className="text-gray-500" />
                    <span className="text-sm">
                      <strong>Viewed on:</strong> {formatDate(share.ViewedAt)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Custom Message */}
          {share.Message && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Custom Message</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{share.Message}</p>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {share.Documents && share.Documents.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Shared Documents ({share.Documents.length})</h4>
                <div className="space-y-2">
                  {share.Documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                          <FiFile className="text-blue-600" size={14} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            {doc.type} • {doc.size}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDownloadDocument(doc.path, doc.name)}>
                        <FiDownload size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[80vh] overflow-hidden"
          >
            <div className="relative h-full">
              {/* Handle */}
              <div className="flex justify-center py-3">
                <div className="w-12 h-1 bg-gray-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-4">
                <div>
                  <h2 className="text-xl font-bold">All Shares</h2>
                  {leadName && <p className="text-sm text-gray-600">for {leadName}</p>}
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <FiX size={20} />
                </Button>
              </div>

              <Separator />

              {/* Content */}
              <div className="relative h-full overflow-hidden">
                <div className="h-full overflow-y-auto pb-20">
                  {loading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : shares.length === 0 ? (
                    <div className="text-center py-12">
                      <FiShare2 className="mx-auto text-gray-400 mb-4" size={48} />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No shares yet</h3>
                      <p className="text-gray-600">This lead hasn't been shared with anyone yet.</p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-3">
                      {shares.map((share) => (
                        <Card
                          key={share.ShareId}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedShare(share)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {share.SharedByName?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <p className="font-medium text-sm truncate">{share.SharedByName}</p>
                                    {getShareMethodIcon(share.ShareMethod)}
                                  </div>

                                  <p className="text-sm text-gray-600 truncate">Shared to: {share.SharedTo}</p>

                                  <div className="flex items-center space-x-3 mt-2">
                                    <Badge
                                      variant="secondary"
                                      className={`text-xs ${getShareMethodColor(share.ShareMethod)}`}
                                    >
                                      {share.ShareMethod.toUpperCase()}
                                    </Badge>

                                    <span className="text-xs text-gray-500">{formatDate(share.CreatedAt)}</span>

                                    {share.Documents && share.Documents.length > 0 && (
                                      <Badge variant="outline" className="text-xs">
                                        {share.Documents.length} docs
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col items-end space-y-1">
                                <Badge variant={share.IsViewed ? "default" : "secondary"}>
                                  {share.IsViewed ? "Viewed" : "Pending"}
                                </Badge>
                              </div>
                            </div>

                            {share.Message && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-sm text-gray-600 line-clamp-2">{share.Message}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Detail View Overlay */}
                <AnimatePresence>{selectedShare && <ShareDetailView share={selectedShare} />}</AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
