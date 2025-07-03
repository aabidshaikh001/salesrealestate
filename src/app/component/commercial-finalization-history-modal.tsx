"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  FiX,
  FiCalendar,
  FiDollarSign,
  FiHome,
  FiCreditCard,
  FiPercent,
  FiRefreshCw,
  FiEye,
  FiMail,
  FiDownload,
} from "react-icons/fi"
import { FaIndianRupeeSign } from "react-icons/fa6"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/providers/auth-provider"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.realestatecompany.co.in/api"

interface CommercialFinalization {
  id: string
  LeadId: number
  brokerId: string
  finalizedUnit: string
  unitType?: string
  floorNumber?: string
  finalPrice: number
  basePrice?: number
  paymentPlan: string
  downPayment?: number
  emiAmount?: number
  discount?: number
  discountType: string
  specialOffers?: string
  remarks?: string
  status: string
  documentUrl?: string
  emailSent: boolean
  createdAt: string
  updatedAt: string
  BrokerName?: string
  BrokerEmail?: string
}

interface CommercialFinalizationHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  leadId: string
  leadName?: string
}

export default function CommercialFinalizationHistoryModal({
  isOpen,
  onClose,
  leadId,
  leadName,
}: CommercialFinalizationHistoryModalProps) {
  const { user, token } = useAuth()
  const [commercialData, setCommercialData] = useState<CommercialFinalization | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedCommercial, setSelectedCommercial] = useState<CommercialFinalization | null>(null)
  const [sendingEmail, setSendingEmail] = useState(false)

  // Fetch commercial data when modal opens
  useEffect(() => {
    if (isOpen && leadId && token) {
      fetchCommercialByLeadId()
    }
  }, [isOpen, leadId, token])

  const fetchCommercialByLeadId = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/commercial-finalization/by-lead/${leadId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          setCommercialData(null)
          return
        }
        throw new Error("Failed to fetch commercial history")
      }

      const data = await response.json()
      if (data.success) {
        setCommercialData(data.data)
      } else {
        throw new Error(data.message || "Failed to fetch commercial history")
      }
    } catch (error) {
      console.error("Error fetching commercial history:", error)
      toast.error("Failed to load commercial history")
    } finally {
      setLoading(false)
    }
  }

  const sendEmailNotification = async () => {
    if (!commercialData) return

    try {
      setSendingEmail(true)
      const response = await fetch(`${API_BASE_URL}/commercial-finalization/send-email/${leadId}`, {
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
        fetchCommercialByLeadId()
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
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
      case "done":
        return "bg-green-100 text-green-800"
      case "in progress":
        return "bg-yellow-100 text-yellow-800"
      case "pending":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getUnitTypeLabel = (unitType: string) => {
    const unitTypes: { [key: string]: string } = {
      "1bhk": "1 BHK",
      "2bhk": "2 BHK",
      "3bhk": "3 BHK",
      "4bhk": "4 BHK",
      penthouse: "Penthouse",
      studio: "Studio Apartment",
    }
    return unitTypes[unitType] || unitType
  }

  const getPaymentPlanLabel = (paymentPlan: string) => {
    const paymentPlans: { [key: string]: string } = {
      construction_linked: "Construction Linked Plan",
      possession_linked: "Possession Linked Plan",
      flexi_payment: "Flexi Payment Plan",
      subvention: "Subvention Scheme",
      custom: "Custom Payment Plan",
    }
    return paymentPlans[paymentPlan] || paymentPlan
  }

  const downloadDocument = (documentUrl: string) => {
    const link = document.createElement("a")
    link.href = documentUrl
    link.download = `commercial-document-${leadId}.pdf`
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
              <h2 className="text-lg font-semibold">Commercial History</h2>
              {leadName && <p className="text-sm text-muted-foreground">{leadName}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={fetchCommercialByLeadId} disabled={loading}>
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
            ) : !commercialData ? (
              <div className="text-center py-8">
                <FiDollarSign className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">No commercial data found</p>
                <p className="text-sm text-gray-400">Commercial finalization details will appear here</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FiCalendar size={16} className="text-gray-500" />
                        <span className="font-medium">{formatDate(commercialData.createdAt)}</span>
                      </div>
                      <Badge className={getStatusColor(commercialData.status)}>{commercialData.status}</Badge>
                    </div>

                    {/* Unit Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2">
                        <FiHome size={16} className="text-blue-600" />
                        <div>
                          <p className="font-medium">{commercialData.finalizedUnit}</p>
                          <div className="flex gap-2 text-sm text-gray-600">
                            {commercialData.unitType && <span>{getUnitTypeLabel(commercialData.unitType)}</span>}
                            {commercialData.floorNumber && (
                              <>
                                <span>•</span>
                                <span>{commercialData.floorNumber}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Price Details */}
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FaIndianRupeeSign size={16} className="text-green-600" />
                          <span className="font-medium text-green-800">Price Details</span>
                        </div>
                        <div className="space-y-1 text-sm">
                          {commercialData.basePrice && (
                            <div className="flex justify-between">
                              <span>Base Price:</span>
                              <span className="font-medium">{formatCurrency(commercialData.basePrice)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Final Price:</span>
                            <span className="font-semibold text-green-700">
                              {formatCurrency(commercialData.finalPrice)}
                            </span>
                          </div>
                          {commercialData.discount && (
                            <div className="flex justify-between">
                              <span>Discount:</span>
                              <span className="text-orange-600">
                                {commercialData.discountType === "percentage"
                                  ? `${commercialData.discount}%`
                                  : formatCurrency(commercialData.discount)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Payment Plan */}
                      <div className="flex items-center gap-2">
                        <FiCreditCard size={16} className="text-purple-600" />
                        <div>
                          <p className="font-medium">Payment Plan</p>
                          <p className="text-sm text-gray-600">{getPaymentPlanLabel(commercialData.paymentPlan)}</p>
                        </div>
                      </div>

                      {(commercialData.downPayment || commercialData.emiAmount) && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {commercialData.downPayment && (
                            <div>
                              <p className="text-gray-500">Down Payment</p>
                              <p className="font-medium">{formatCurrency(commercialData.downPayment)}</p>
                            </div>
                          )}
                          {commercialData.emiAmount && (
                            <div>
                              <p className="text-gray-500">EMI Amount</p>
                              <p className="font-medium">{formatCurrency(commercialData.emiAmount)}/month</p>
                            </div>
                          )}
                        </div>
                      )}

                      {commercialData.specialOffers && (
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <FiPercent size={16} className="text-orange-600" />
                            <span className="font-medium text-orange-800">Special Offers</span>
                          </div>
                          <p className="text-sm text-orange-700">{commercialData.specialOffers}</p>
                        </div>
                      )}

                      {commercialData.remarks && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium mb-1">Remarks</p>
                          <p className="text-sm text-gray-600">{commercialData.remarks}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => setSelectedCommercial(commercialData)}>
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
                        {sendingEmail ? "Sending..." : commercialData.emailSent ? "Resend Email" : "Send Email"}
                      </Button>
                      {commercialData.documentUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadDocument(commercialData.documentUrl!)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <FiDownload size={14} className="mr-1" />
                          Document
                        </Button>
                      )}
                    </div>

                    {/* Email Status */}
                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <div
                        className={`w-2 h-2 rounded-full ${commercialData.emailSent ? "bg-green-500" : "bg-gray-400"}`}
                      />
                      <span className="text-gray-500">
                        Email {commercialData.emailSent ? "sent" : "not sent"} • Updated{" "}
                        {formatTime(commercialData.updatedAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </motion.div>

        {/* Commercial Details Modal */}
        {selectedCommercial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSelectedCommercial(null)}
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
                  <h3 className="text-lg font-semibold">Commercial Details</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCommercial(null)}>
                    <FiX size={20} />
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status</span>
                  <Badge className={getStatusColor(selectedCommercial.status)}>{selectedCommercial.status}</Badge>
                </div>

                <div className="space-y-4">
                  {/* Unit Information */}
                  <div className="border-b pb-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <FiHome size={16} className="text-blue-600" />
                      Unit Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Unit Number:</span>
                        <span className="font-medium">{selectedCommercial.finalizedUnit}</span>
                      </div>
                      {selectedCommercial.unitType && (
                        <div className="flex justify-between">
                          <span>Unit Type:</span>
                          <span>{getUnitTypeLabel(selectedCommercial.unitType)}</span>
                        </div>
                      )}
                      {selectedCommercial.floorNumber && (
                        <div className="flex justify-between">
                          <span>Floor:</span>
                          <span>{selectedCommercial.floorNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing Information */}
                  <div className="border-b pb-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <FaIndianRupeeSign size={16} className="text-green-600" />
                      Pricing Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      {selectedCommercial.basePrice && (
                        <div className="flex justify-between">
                          <span>Base Price:</span>
                          <span>{formatCurrency(selectedCommercial.basePrice)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Final Price:</span>
                        <span className="font-semibold text-green-700">
                          {formatCurrency(selectedCommercial.finalPrice)}
                        </span>
                      </div>
                      {selectedCommercial.discount && (
                        <div className="flex justify-between">
                          <span>Discount:</span>
                          <span className="text-orange-600">
                            {selectedCommercial.discountType === "percentage"
                              ? `${selectedCommercial.discount}%`
                              : formatCurrency(selectedCommercial.discount)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="border-b pb-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <FiCreditCard size={16} className="text-purple-600" />
                      Payment Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Payment Plan:</span>
                        <span>{getPaymentPlanLabel(selectedCommercial.paymentPlan)}</span>
                      </div>
                      {selectedCommercial.downPayment && (
                        <div className="flex justify-between">
                          <span>Down Payment:</span>
                          <span>{formatCurrency(selectedCommercial.downPayment)}</span>
                        </div>
                      )}
                      {selectedCommercial.emiAmount && (
                        <div className="flex justify-between">
                          <span>EMI Amount:</span>
                          <span>{formatCurrency(selectedCommercial.emiAmount)}/month</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Information */}
                  {(selectedCommercial.specialOffers || selectedCommercial.remarks) && (
                    <div>
                      <h4 className="font-medium mb-2">Additional Information</h4>
                      {selectedCommercial.specialOffers && (
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-1">Special Offers:</p>
                          <p className="text-sm text-gray-600 bg-orange-50 p-2 rounded">
                            {selectedCommercial.specialOffers}
                          </p>
                        </div>
                      )}
                      {selectedCommercial.remarks && (
                        <div>
                          <p className="text-sm font-medium mb-1">Remarks:</p>
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{selectedCommercial.remarks}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 text-xs text-gray-500">
                  <p>Created: {new Date(selectedCommercial.createdAt).toLocaleString()}</p>
                  <p>Updated: {new Date(selectedCommercial.updatedAt).toLocaleString()}</p>
                  <p>Email Status: {selectedCommercial.emailSent ? "Sent" : "Not Sent"}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  )
}
