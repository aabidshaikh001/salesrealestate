"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  FiX,
  FiCalendar,
  FiFileText,
  FiRefreshCw,
  FiEye,
  FiMail,
  FiDownload,
  FiEdit3,
  FiSave,
  FiDollarSign,
} from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/providers/auth-provider"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.realestatecompany.co.in/api"

interface LoanDocument {
  id: string
  documentUrl: string
  documentName: string
  documentSize: number
  documentType: string
  createdAt: string
}

interface LoanAssistance {
  id: string
  leadId: number
  brokerId: string
  bank: string
  loanStatus: string
  notes?: string
  emailSent: boolean
  createdAt: string
  updatedAt: string
  documents: LoanDocument[]
}

interface LoanAssistanceHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  leadId: string
  leadName?: string
  onUpdate?: (data: { bank: string; loanStatus: string; notes: string }) => void
}

export default function LoanAssistanceHistoryModal({
  isOpen,
  onClose,
  leadId,
  leadName,
  onUpdate,
}: LoanAssistanceHistoryModalProps) {
  const { user, token } = useAuth()
  const [loanData, setLoanData] = useState<LoanAssistance | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<LoanAssistance | null>(null)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [editing, setEditing] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [editData, setEditData] = useState({
    bank: "",
    loanStatus: "",
    notes: "",
  })

  const banks = [
    { value: "hdfc", label: "HDFC Bank" },
    { value: "sbi", label: "State Bank of India" },
    { value: "icici", label: "ICICI Bank" },
    { value: "axis", label: "Axis Bank" },
    { value: "pnb", label: "Punjab National Bank" },
    { value: "kotak", label: "Kotak Mahindra Bank" },
    { value: "yes", label: "Yes Bank" },
    { value: "indusind", label: "IndusInd Bank" },
  ]

  const loanStatuses = [
    { value: "Initiated", label: "Initiated" },
    { value: "Documents Submitted", label: "Documents Submitted" },
    { value: "Under Review", label: "Under Review" },
    { value: "Approved", label: "Approved" },
    { value: "Rejected", label: "Rejected" },
    { value: "Disbursed", label: "Disbursed" },
  ]

  // Fetch loan data when modal opens
  useEffect(() => {
    if (isOpen && leadId && token) {
      fetchLoanByLeadId()
    }
  }, [isOpen, leadId, token])

  const fetchLoanByLeadId = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/loan-assistance/by-lead/${leadId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          setLoanData(null)
          return
        }
        throw new Error("Failed to fetch loan history")
      }

      const data = await response.json()
      if (data.success) {
        setLoanData(data.data)
        setEditData({
          bank: data.data.bank || "",
          loanStatus: data.data.loanStatus || "",
          notes: data.data.notes || "",
        })
      } else {
        throw new Error(data.message || "Failed to fetch loan history")
      }
    } catch (error) {
      console.error("Error fetching loan history:", error)
      toast.error("Failed to load loan history")
    } finally {
      setLoading(false)
    }
  }

  const updateLoanData = async () => {
    if (!loanData || !user?.id || !token) {
      toast.error("Missing required data")
      return
    }

    try {
      setUpdating(true)

      const formData = new FormData()
      formData.append("leadId", leadId)
      formData.append("brokerId", user.id)
      formData.append("bank", editData.bank)
      formData.append("loanStatus", editData.loanStatus)
      formData.append("notes", editData.notes)

      const response = await fetch(`${API_BASE_URL}/loan-assistance`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update loan data")
      }

      const result = await response.json()

      if (result.success) {
        toast.success("Loan data updated successfully")
        setEditing(false)
        // Refresh data
        await fetchLoanByLeadId()
        // Notify parent component
        if (onUpdate) {
          onUpdate(editData)
        }
      } else {
        throw new Error(result.error || "Failed to update loan data")
      }
    } catch (error) {
      console.error("Error updating loan data:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update loan data")
    } finally {
      setUpdating(false)
    }
  }

  const sendEmailNotification = async () => {
    if (!loanData) return

    try {
      setSendingEmail(true)
      const response = await fetch(`${API_BASE_URL}/loan-assistance/send-email/${leadId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to send email")
      }

      const result = await response.json()
      if (result.success) {
        toast.success("Email sent successfully")
        // Refresh data to update emailSent status
        fetchLoanByLeadId()
      } else {
        throw new Error(result.message || "Failed to send email")
      }
    } catch (error) {
      console.error("Error sending email:", error)
      toast.error("Failed to send email")
    } finally {
      setSendingEmail(false)
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
      case "approved":
        return "bg-green-100 text-green-800"
      case "disbursed":
        return "bg-blue-100 text-blue-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "under review":
        return "bg-yellow-100 text-yellow-800"
      case "documents submitted":
        return "bg-purple-100 text-purple-800"
      case "initiated":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getBankLabel = (bankValue: string) => {
    const bank = banks.find((b) => b.value === bankValue)
    return bank ? bank.label : bankValue
  }

  const getStatusLabel = (statusValue: string) => {
    const status = loanStatuses.find((s) => s.value === statusValue)
    return status ? status.label : statusValue
  }

  const downloadDocument = (doc: LoanDocument) => {
    const link = document.createElement("a")
    link.href = `${API_BASE_URL}${doc.documentUrl}`
    link.download = doc.documentName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
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
              <h2 className="text-lg font-semibold">Loan Assistance History</h2>
              {leadName && <p className="text-sm text-muted-foreground">{leadName}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={fetchLoanByLeadId} disabled={loading}>
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
            ) : !loanData ? (
              <div className="text-center py-8">
                <FiDollarSign className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">No loan assistance data found</p>
                <p className="text-sm text-gray-400">Loan assistance details will appear here</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FiCalendar size={16} className="text-gray-500" />
                        <span className="font-medium">{formatDate(loanData.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(loanData.loanStatus)}>
                          {getStatusLabel(loanData.loanStatus)}
                        </Badge>
                        {!editing && (
                          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                            <FiEdit3 size={14} />
                          </Button>
                        )}
                      </div>
                    </div>

                    {editing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Partner Bank</label>
                          <Select
                            value={editData.bank}
                            onValueChange={(value) => setEditData({ ...editData, bank: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a bank" />
                            </SelectTrigger>
                            <SelectContent>
                              {banks.map((bank) => (
                                <SelectItem key={bank.value} value={bank.value}>
                                  {bank.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-1 block">Loan Status</label>
                          <Select
                            value={editData.loanStatus}
                            onValueChange={(value) => setEditData({ ...editData, loanStatus: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {loanStatuses.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-1 block">Notes</label>
                          <Textarea
                            value={editData.notes}
                            onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                            placeholder="Add follow-up notes..."
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditing(false)
                              setEditData({
                                bank: loanData.bank || "",
                                loanStatus: loanData.loanStatus || "",
                                notes: loanData.notes || "",
                              })
                            }}
                            disabled={updating}
                            className="bg-transparent"
                          >
                            Cancel
                          </Button>
                          <Button size="sm" onClick={updateLoanData} disabled={updating}>
                            <FiSave size={14} className="mr-1" />
                            {updating ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Bank Information */}
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <FiDollarSign size={16} className="text-blue-600" />
                            <span className="font-medium text-blue-800">Bank Details</span>
                          </div>
                          <p className="text-sm text-blue-700">{getBankLabel(loanData.bank)}</p>
                        </div>

                        {/* Documents */}
                        {loanData.documents && loanData.documents.length > 0 && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <FiFileText size={16} className="text-gray-600" />
                              <span className="font-medium text-gray-800">Documents ({loanData.documents.length})</span>
                            </div>
                            <div className="space-y-2">
                              {loanData.documents.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2 flex-1">
                                    <FiFileText size={14} className="text-gray-500" />
                                    <span className="truncate">{doc.documentName}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">{formatFileSize(doc.documentSize)}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => downloadDocument(doc)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <FiDownload size={12} />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {loanData.notes && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="font-medium mb-1">Notes</p>
                            <p className="text-sm text-gray-600">{loanData.notes}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {!editing && (
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={() => setSelectedLoan(loanData)}>
                          <FiEye size={14} className="mr-1" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={sendEmailNotification}
                          disabled={sendingEmail}
                          className="text-blue-600 hover:text-blue-700 bg-transparent"
                        >
                          <FiMail size={14} className="mr-1" />
                          {sendingEmail ? "Sending..." : loanData.emailSent ? "Resend Email" : "Send Email"}
                        </Button>
                      </div>
                    )}

                    {/* Email Status */}
                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${loanData.emailSent ? "bg-green-500" : "bg-gray-400"}`} />
                      <span className="text-gray-500">
                        Email {loanData.emailSent ? "sent" : "not sent"} • Updated {formatTime(loanData.updatedAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </motion.div>

        {/* Loan Details Modal */}
        {selectedLoan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSelectedLoan(null)}
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
                  <h3 className="text-lg font-semibold">Loan Assistance Details</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedLoan(null)}>
                    <FiX size={20} />
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status</span>
                  <Badge className={getStatusColor(selectedLoan.loanStatus)}>
                    {getStatusLabel(selectedLoan.loanStatus)}
                  </Badge>
                </div>

                <div className="space-y-4">
                  {/* Bank Information */}
                  <div className="border-b pb-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <FiDollarSign size={16} className="text-blue-600" />
                      Bank Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Partner Bank:</span>
                        <span className="font-medium">{getBankLabel(selectedLoan.bank)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Application Date:</span>
                        <span>{formatDate(selectedLoan.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span>{formatDate(selectedLoan.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  {selectedLoan.documents && selectedLoan.documents.length > 0 && (
                    <div className="border-b pb-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <FiFileText size={16} className="text-gray-600" />
                        Documents ({selectedLoan.documents.length})
                      </h4>
                      <div className="space-y-2">
                        {selectedLoan.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <FiFileText size={14} className="text-gray-500" />
                              <div>
                                <p className="font-medium truncate">{doc.documentName}</p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(doc.documentSize)} • {new Date(doc.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadDocument(doc)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <FiDownload size={14} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedLoan.notes && (
                    <div>
                      <h4 className="font-medium mb-2">Notes</h4>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-600">{selectedLoan.notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 text-xs text-gray-500">
                  <p>Created: {new Date(selectedLoan.createdAt).toLocaleString()}</p>
                  <p>Updated: {new Date(selectedLoan.updatedAt).toLocaleString()}</p>
                  <p>Email Status: {selectedLoan.emailSent ? "Sent" : "Not Sent"}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  )
}
