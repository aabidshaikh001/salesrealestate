"use client"

import type React from "react"

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
  FiHome,
  FiDollarSign,
  FiUpload,
} from "react-icons/fi"
import { FaIndianRupeeSign } from "react-icons/fa6"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/providers/auth-provider"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.realestatecompany.co.in/api"

interface DealDocument {
  id: string
  documentUrl: string
  documentName: string
  documentSize: number
  documentType: string
  createdAt: string
}

interface DealClosure {
  id: string
  leadId: number
  brokerId: string
  unitNumber: string
  unitType?: string
  floorNumber?: string
  carpetArea?: string
  builtUpArea?: string
  superBuiltUpArea?: string
  pricePerSqFt?: number
  baseAmount: number
  parkingCharges?: number
  maintenanceDeposit?: number
  registrationCharges?: number
  stampDuty?: number
  totalAmount: number
  remarks?: string
  isDealClosed: boolean
  emailSent: boolean
  createdAt: string
  updatedAt: string
  documents: DealDocument[]
}

interface DealClosureHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  leadId: string
  leadName?: string
  onUpdate?: (data: { propertyData: any; isDealClosed: boolean }) => void
}

export default function DealClosureHistoryModal({
  isOpen,
  onClose,
  leadId,
  leadName,
  onUpdate,
}: DealClosureHistoryModalProps) {
  const { user, token } = useAuth()
  const [dealData, setDealData] = useState<DealClosure | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<DealClosure | null>(null)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [editing, setEditing] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [newDocuments, setNewDocuments] = useState<File[]>([])
  const [uploadingDocs, setUploadingDocs] = useState(false)

  const [editData, setEditData] = useState({
    unitNumber: "",
    unitType: "",
    floorNumber: "",
    carpetArea: "",
    builtUpArea: "",
    superBuiltUpArea: "",
    pricePerSqFt: "",
    baseAmount: "",
    parkingCharges: "",
    maintenanceDeposit: "",
    registrationCharges: "",
    stampDuty: "",
    totalAmount: "",
    remarks: "",
    isDealClosed: false,
  })

  const unitTypes = [
    { value: "1bhk", label: "1 BHK" },
    { value: "2bhk", label: "2 BHK" },
    { value: "3bhk", label: "3 BHK" },
    { value: "4bhk", label: "4 BHK" },
    { value: "penthouse", label: "Penthouse" },
    { value: "studio", label: "Studio Apartment" },
  ]

  // Fetch deal data when modal opens
  useEffect(() => {
    if (isOpen && leadId && token) {
      fetchDealByLeadId()
    }
  }, [isOpen, leadId, token])

  const fetchDealByLeadId = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/deal-closure/by-lead/${leadId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          setDealData(null)
          return
        }
        throw new Error("Failed to fetch deal history")
      }

      const data = await response.json()
      if (data.success) {
        setDealData(data.data)
        setEditData({
          unitNumber: data.data.unitNumber || "",
          unitType: data.data.unitType || "",
          floorNumber: data.data.floorNumber || "",
          carpetArea: data.data.carpetArea || "",
          builtUpArea: data.data.builtUpArea || "",
          superBuiltUpArea: data.data.superBuiltUpArea || "",
          pricePerSqFt: data.data.pricePerSqFt?.toString() || "",
          baseAmount: data.data.baseAmount?.toString() || "",
          parkingCharges: data.data.parkingCharges?.toString() || "",
          maintenanceDeposit: data.data.maintenanceDeposit?.toString() || "",
          registrationCharges: data.data.registrationCharges?.toString() || "",
          stampDuty: data.data.stampDuty?.toString() || "",
          totalAmount: data.data.totalAmount?.toString() || "",
          remarks: data.data.remarks || "",
          isDealClosed: data.data.isDealClosed || false,
        })
      } else {
        throw new Error(data.message || "Failed to fetch deal history")
      }
    } catch (error) {
      console.error("Error fetching deal history:", error)
      toast.error("Failed to load deal history")
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalAmount = () => {
    const baseAmount = Number.parseFloat(editData.baseAmount.replace(/,/g, "")) || 0
    const parkingCharges = Number.parseFloat(editData.parkingCharges.replace(/,/g, "")) || 0
    const maintenanceDeposit = Number.parseFloat(editData.maintenanceDeposit.replace(/,/g, "")) || 0
    const registrationCharges = Number.parseFloat(editData.registrationCharges.replace(/,/g, "")) || 0
    const stampDuty = Number.parseFloat(editData.stampDuty.replace(/,/g, "")) || 0
    const total = baseAmount + parkingCharges + maintenanceDeposit + registrationCharges + stampDuty
    setEditData((prev) => ({
      ...prev,
      totalAmount: total.toLocaleString("en-IN"),
    }))
  }

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)

      // Validate file types
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]

      const validFiles = files.filter((file) => allowedTypes.includes(file.type))
      if (validFiles.length !== files.length) {
        toast.error("Only PDF, Word, JPEG, and PNG files are allowed")
        return
      }

      // Validate file sizes (10MB limit)
      const oversizedFiles = validFiles.filter((file) => file.size > 10 * 1024 * 1024)
      if (oversizedFiles.length > 0) {
        toast.error("Some files are too large. Maximum size is 10MB per file.")
        return
      }

      setNewDocuments([...newDocuments, ...validFiles])
      toast.success(`${validFiles.length} document(s) added`)
    }
  }

  const removeNewDocument = (index: number) => {
    const updatedDocs = newDocuments.filter((_, i) => i !== index)
    setNewDocuments(updatedDocs)
    toast.success("Document removed")
  }

  const updateDealData = async () => {
    if (!dealData || !user?.id || !token) {
      toast.error("Missing required data")
      return
    }

    try {
      setUpdating(true)

      const formData = new FormData()
      formData.append("leadId", leadId)
      formData.append("brokerId", user.id)
      formData.append("unitNumber", editData.unitNumber)
      formData.append("unitType", editData.unitType)
      formData.append("floorNumber", editData.floorNumber)
      formData.append("carpetArea", editData.carpetArea)
      formData.append("builtUpArea", editData.builtUpArea)
      formData.append("superBuiltUpArea", editData.superBuiltUpArea)
      formData.append("pricePerSqFt", editData.pricePerSqFt.replace(/,/g, ""))
      formData.append("baseAmount", editData.baseAmount.replace(/,/g, ""))
      formData.append("parkingCharges", editData.parkingCharges.replace(/,/g, ""))
      formData.append("maintenanceDeposit", editData.maintenanceDeposit.replace(/,/g, ""))
      formData.append("registrationCharges", editData.registrationCharges.replace(/,/g, ""))
      formData.append("stampDuty", editData.stampDuty.replace(/,/g, ""))
      formData.append("totalAmount", editData.totalAmount.replace(/,/g, ""))
      formData.append("remarks", editData.remarks)
      formData.append("isDealClosed", editData.isDealClosed.toString())

      // Append new documents
      newDocuments.forEach((doc) => {
        formData.append("documents", doc)
      })

      const response = await fetch(`${API_BASE_URL}/deal-closure`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update deal data")
      }

      const result = await response.json()

      if (result.success) {
        toast.success("Deal data updated successfully")
        setEditing(false)
        setNewDocuments([])
        // Refresh data
        await fetchDealByLeadId()
        // Notify parent component
        if (onUpdate) {
          onUpdate({
            propertyData: {
              unitNumber: editData.unitNumber,
              unitType: editData.unitType,
              floorNumber: editData.floorNumber,
              carpetArea: editData.carpetArea,
              builtUpArea: editData.builtUpArea,
              superBuiltUpArea: editData.superBuiltUpArea,
              pricePerSqFt: editData.pricePerSqFt,
              baseAmount: editData.baseAmount,
              parkingCharges: editData.parkingCharges,
              maintenanceDeposit: editData.maintenanceDeposit,
              registrationCharges: editData.registrationCharges,
              stampDuty: editData.stampDuty,
              totalAmount: editData.totalAmount,
              remarks: editData.remarks,
            },
            isDealClosed: editData.isDealClosed,
          })
        }
      } else {
        throw new Error(result.error || "Failed to update deal data")
      }
    } catch (error) {
      console.error("Error updating deal data:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update deal data")
    } finally {
      setUpdating(false)
    }
  }

  const sendEmailNotification = async () => {
    if (!dealData) return

    try {
      setSendingEmail(true)
      const response = await fetch(`${API_BASE_URL}/deal-closure/send-email/${leadId}`, {
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
        fetchDealByLeadId()
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

  const getUnitTypeLabel = (unitType: string) => {
    const unit = unitTypes.find((u) => u.value === unitType)
    return unit ? unit.label : unitType
  }

  const downloadDocument = (doc: DealDocument) => {
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

  const isImageFile = (filename: string) => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"]
    return imageExtensions.some((ext) => filename.toLowerCase().endsWith(ext))
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
              <h2 className="text-lg font-semibold">Deal Closure History</h2>
              {leadName && <p className="text-sm text-muted-foreground">{leadName}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={fetchDealByLeadId} disabled={loading}>
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
            ) : !dealData ? (
              <div className="text-center py-8">
                <FiDollarSign className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">No deal closure data found</p>
                <p className="text-sm text-gray-400">Deal closure details will appear here</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FiCalendar size={16} className="text-gray-500" />
                        <span className="font-medium">{formatDate(dealData.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            dealData.isDealClosed ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {dealData.isDealClosed ? "Closed" : "In Progress"}
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
                        {/* Unit Details */}
                        <div className="space-y-3">
                          <h4 className="font-medium flex items-center gap-2">
                            <FiHome size={16} className="text-blue-600" />
                            Unit Details
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm font-medium mb-1 block">Unit Number</label>
                              <Input
                                value={editData.unitNumber}
                                onChange={(e) => setEditData({ ...editData, unitNumber: e.target.value })}
                                placeholder="A-1201"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1 block">Unit Type</label>
                              <Select
                                value={editData.unitType}
                                onValueChange={(value) => setEditData({ ...editData, unitType: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {unitTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-sm font-medium mb-1 block">Carpet Area</label>
                              <Input
                                value={editData.carpetArea}
                                onChange={(e) => setEditData({ ...editData, carpetArea: e.target.value })}
                                placeholder="1200 sq ft"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1 block">Built-up</label>
                              <Input
                                value={editData.builtUpArea}
                                onChange={(e) => setEditData({ ...editData, builtUpArea: e.target.value })}
                                placeholder="1350 sq ft"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1 block">Super Built-up</label>
                              <Input
                                value={editData.superBuiltUpArea}
                                onChange={(e) => setEditData({ ...editData, superBuiltUpArea: e.target.value })}
                                placeholder="1500 sq ft"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Amount Details */}
                        <div className="space-y-3">
                          <h4 className="font-medium flex items-center gap-2">
                            <FaIndianRupeeSign size={16} className="text-green-600" />
                            Amount Details
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm font-medium mb-1 block">Base Amount</label>
                              <Input
                                value={editData.baseAmount}
                                onChange={(e) => setEditData({ ...editData, baseAmount: e.target.value })}
                                onBlur={calculateTotalAmount}
                                placeholder="85,00,000"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1 block">Parking Charges</label>
                              <Input
                                value={editData.parkingCharges}
                                onChange={(e) => setEditData({ ...editData, parkingCharges: e.target.value })}
                                onBlur={calculateTotalAmount}
                                placeholder="2,50,000"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm font-medium mb-1 block">Registration</label>
                              <Input
                                value={editData.registrationCharges}
                                onChange={(e) => setEditData({ ...editData, registrationCharges: e.target.value })}
                                onBlur={calculateTotalAmount}
                                placeholder="5,10,000"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1 block">Stamp Duty</label>
                              <Input
                                value={editData.stampDuty}
                                onChange={(e) => setEditData({ ...editData, stampDuty: e.target.value })}
                                onBlur={calculateTotalAmount}
                                placeholder="4,25,000"
                              />
                            </div>
                          </div>
                          <div className="bg-green-50 p-3 rounded">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Total Amount:</span>
                              <span className="font-bold text-green-700">₹{editData.totalAmount || "0"}</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={calculateTotalAmount}
                              className="mt-2 w-full text-green-700 border-green-300 bg-transparent"
                            >
                              Calculate Total
                            </Button>
                          </div>
                        </div>

                        {/* Document Upload */}
                        <div className="space-y-3">
                          <h4 className="font-medium">Add Documents</h4>
                          {newDocuments.length > 0 && (
                            <div className="space-y-2">
                              {newDocuments.map((doc, index) => (
                                <div key={index} className="flex items-center p-2 bg-gray-50 rounded text-sm">
                                  <span className="flex-1 truncate">{doc.name}</span>
                                  <span className="text-xs text-gray-500 mr-2">{formatFileSize(doc.size)}</span>
                                  <button
                                    onClick={() => removeNewDocument(index)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById("new-document-upload")?.click()}
                            className="w-full bg-transparent"
                          >
                            <FiUpload size={14} className="mr-2" />
                            Upload Documents
                          </Button>
                          <input
                            id="new-document-upload"
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            multiple
                            className="hidden"
                            onChange={handleDocumentUpload}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditing(false)
                              setNewDocuments([])
                              setEditData({
                                unitNumber: dealData.unitNumber || "",
                                unitType: dealData.unitType || "",
                                floorNumber: dealData.floorNumber || "",
                                carpetArea: dealData.carpetArea || "",
                                builtUpArea: dealData.builtUpArea || "",
                                superBuiltUpArea: dealData.superBuiltUpArea || "",
                                pricePerSqFt: dealData.pricePerSqFt?.toString() || "",
                                baseAmount: dealData.baseAmount?.toString() || "",
                                parkingCharges: dealData.parkingCharges?.toString() || "",
                                maintenanceDeposit: dealData.maintenanceDeposit?.toString() || "",
                                registrationCharges: dealData.registrationCharges?.toString() || "",
                                stampDuty: dealData.stampDuty?.toString() || "",
                                totalAmount: dealData.totalAmount?.toString() || "",
                                remarks: dealData.remarks || "",
                                isDealClosed: dealData.isDealClosed || false,
                              })
                            }}
                            disabled={updating}
                            className="bg-transparent"
                          >
                            Cancel
                          </Button>
                          <Button size="sm" onClick={updateDealData} disabled={updating}>
                            <FiSave size={14} className="mr-1" />
                            {updating ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Unit Information */}
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <FiHome size={16} className="text-blue-600" />
                            <span className="font-medium text-blue-800">Unit Information</span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Unit Number:</span>
                              <span className="font-medium">{dealData.unitNumber}</span>
                            </div>
                            {dealData.unitType && (
                              <div className="flex justify-between">
                                <span>Type:</span>
                                <span>{getUnitTypeLabel(dealData.unitType)}</span>
                              </div>
                            )}
                            {dealData.carpetArea && (
                              <div className="flex justify-between">
                                <span>Carpet Area:</span>
                                <span>{dealData.carpetArea}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Amount Information */}
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <FaIndianRupeeSign size={16} className="text-green-600" />
                            <span className="font-medium text-green-800">Amount Breakdown</span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Base Amount:</span>
                              <span>{formatCurrency(dealData.baseAmount)}</span>
                            </div>
                            {dealData.parkingCharges && (
                              <div className="flex justify-between">
                                <span>Parking:</span>
                                <span>{formatCurrency(dealData.parkingCharges)}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-semibold border-t pt-1">
                              <span>Total:</span>
                              <span className="text-green-700">{formatCurrency(dealData.totalAmount)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Documents */}
                        {dealData.documents && dealData.documents.length > 0 && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <FiFileText size={16} className="text-gray-600" />
                              <span className="font-medium text-gray-800">Documents ({dealData.documents.length})</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {dealData.documents.map((doc, index) => (
                                <div
                                  key={doc.id}
                                  className="relative group cursor-pointer"
                                  onClick={() => {
                                    if (isImageFile(doc.documentName)) {
                                      setSelectedImageIndex(index)
                                    } else {
                                      downloadDocument(doc)
                                    }
                                  }}
                                >
                                  {isImageFile(doc.documentName) ? (
                                    <img
                                      src={`${API_BASE_URL}${doc.documentUrl}`}
                                      alt={doc.documentName}
                                      className="w-full h-20 object-cover rounded"
                                    />
                                  ) : (
                                    <div className="w-full h-20 bg-gray-200 rounded flex items-center justify-center">
                                      <FiFileText size={24} className="text-gray-500" />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded flex items-center justify-center">
                                    <FiEye
                                      className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                      size={20}
                                    />
                                  </div>
                                  <p className="text-xs mt-1 truncate">{doc.documentName}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {dealData.remarks && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="font-medium mb-1">Remarks</p>
                            <p className="text-sm text-gray-600">{dealData.remarks}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {!editing && (
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={() => setSelectedDeal(dealData)}>
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
                          {sendingEmail ? "Sending..." : dealData.emailSent ? "Resend Email" : "Send Email"}
                        </Button>
                      </div>
                    )}

                    {/* Email Status */}
                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${dealData.emailSent ? "bg-green-500" : "bg-gray-400"}`} />
                      <span className="text-gray-500">
                        Email {dealData.emailSent ? "sent" : "not sent"} • Updated {formatTime(dealData.updatedAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </motion.div>

        {/* Image Viewer Modal */}
        {selectedImageIndex !== null && dealData?.documents && (
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
                src={`${API_BASE_URL}${dealData.documents[selectedImageIndex].documentUrl}`}
                alt={dealData.documents[selectedImageIndex].documentName}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white"
                  onClick={() => downloadDocument(dealData.documents[selectedImageIndex])}
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
              {dealData.documents.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white"
                    onClick={() =>
                      setSelectedImageIndex(
                        selectedImageIndex > 0 ? selectedImageIndex - 1 : dealData.documents.length - 1,
                      )
                    }
                  >
                    Previous
                  </Button>
                  <span className="bg-white/20 text-white px-3 py-1 rounded text-sm">
                    {selectedImageIndex + 1} / {dealData.documents.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white"
                    onClick={() =>
                      setSelectedImageIndex(
                        selectedImageIndex < dealData.documents.length - 1 ? selectedImageIndex + 1 : 0,
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

        {/* Deal Details Modal */}
        {selectedDeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSelectedDeal(null)}
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
                  <h3 className="text-lg font-semibold">Deal Closure Details</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedDeal(null)}>
                    <FiX size={20} />
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status</span>
                  <Badge
                    className={
                      selectedDeal.isDealClosed ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {selectedDeal.isDealClosed ? "Closed" : "In Progress"}
                  </Badge>
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
                        <span className="font-medium">{selectedDeal.unitNumber}</span>
                      </div>
                      {selectedDeal.unitType && (
                        <div className="flex justify-between">
                          <span>Unit Type:</span>
                          <span>{getUnitTypeLabel(selectedDeal.unitType)}</span>
                        </div>
                      )}
                      {selectedDeal.floorNumber && (
                        <div className="flex justify-between">
                          <span>Floor:</span>
                          <span>{selectedDeal.floorNumber}</span>
                        </div>
                      )}
                      {selectedDeal.carpetArea && (
                        <div className="flex justify-between">
                          <span>Carpet Area:</span>
                          <span>{selectedDeal.carpetArea}</span>
                        </div>
                      )}
                      {selectedDeal.builtUpArea && (
                        <div className="flex justify-between">
                          <span>Built-up Area:</span>
                          <span>{selectedDeal.builtUpArea}</span>
                        </div>
                      )}
                      {selectedDeal.superBuiltUpArea && (
                        <div className="flex justify-between">
                          <span>Super Built-up:</span>
                          <span>{selectedDeal.superBuiltUpArea}</span>
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
                      <div className="flex justify-between">
                        <span>Base Amount:</span>
                        <span>{formatCurrency(selectedDeal.baseAmount)}</span>
                      </div>
                      {selectedDeal.parkingCharges && (
                        <div className="flex justify-between">
                          <span>Parking Charges:</span>
                          <span>{formatCurrency(selectedDeal.parkingCharges)}</span>
                        </div>
                      )}
                      {selectedDeal.maintenanceDeposit && (
                        <div className="flex justify-between">
                          <span>Maintenance Deposit:</span>
                          <span>{formatCurrency(selectedDeal.maintenanceDeposit)}</span>
                        </div>
                      )}
                      {selectedDeal.registrationCharges && (
                        <div className="flex justify-between">
                          <span>Registration Charges:</span>
                          <span>{formatCurrency(selectedDeal.registrationCharges)}</span>
                        </div>
                      )}
                      {selectedDeal.stampDuty && (
                        <div className="flex justify-between">
                          <span>Stamp Duty:</span>
                          <span>{formatCurrency(selectedDeal.stampDuty)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold border-t pt-2">
                        <span>Total Amount:</span>
                        <span className="text-green-700">{formatCurrency(selectedDeal.totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  {selectedDeal.documents && selectedDeal.documents.length > 0 && (
                    <div className="border-b pb-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <FiFileText size={16} className="text-gray-600" />
                        Documents ({selectedDeal.documents.length})
                      </h4>
                      <div className="space-y-2">
                        {selectedDeal.documents.map((doc) => (
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

                  {/* Remarks */}
                  {selectedDeal.remarks && (
                    <div>
                      <h4 className="font-medium mb-2">Remarks</h4>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-600">{selectedDeal.remarks}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 text-xs text-gray-500">
                  <p>Created: {new Date(selectedDeal.createdAt).toLocaleString()}</p>
                  <p>Updated: {new Date(selectedDeal.updatedAt).toLocaleString()}</p>
                  <p>Email Status: {selectedDeal.emailSent ? "Sent" : "Not Sent"}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  )
}
