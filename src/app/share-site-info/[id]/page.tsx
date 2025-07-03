"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { FiShare2, FiEye, FiMapPin, FiPhone, FiMail, FiUpload, FiFile, FiX,  FiList } from "react-icons/fi"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/providers/auth-provider"
import GetAllSharesModal from "../../component/get-all-shares-modal"

interface Property {
  PropertyId: string
  title: string
  location: string
  price: string
  pricePerSqft: string
  latitude: number
  longitude: number
  propertyType: string
  status: string
  propertyFor: string
  images: string[]
  bhkOptions: string[]
  superBuiltUpArea: string
  carpetArea: string
  isFeatured: boolean
  description: string
  luxarfeature: null | string
  luxar: null | string
  projectId: number
  IsDeleted: boolean
  TransDate: string
  TranDateUpdate: null | string
  TranDateDel: null | string
  TransBy: null | string
  TranByUpdate: null | string
  TranByDel: null | string
  IsActive: boolean
  BuiltUpArea: string
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

interface Document {
  id: string
  name: string
  type: string
  size: string
  url: string
  uploaded: boolean
  logo?: string
  status?: boolean
}

interface OtherDocument {
  id: number
  propertyId: string
  title: string
  logo: string
  docLink: string
  status: boolean
  createdAt: string
  updatedAt: string
}

export default function ShareSiteInfoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, token } = useAuth()
  const [leadData, setLeadData] = useState<LeadData | null>(null)
  const [propertyData, setPropertyData] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [propertyLoading, setPropertyLoading] = useState(true)
  const [documentsLoading, setDocumentsLoading] = useState(true)
  const [otherDocumentsLoading, setOtherDocumentsLoading] = useState(true)
  const [shareMethod, setShareMethod] = useState("email")
  const [customMessage, setCustomMessage] = useState("")
  const [recipientInfo, setRecipientInfo] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    budget: "",
    timeline: "",
    occupation: "",
    company: "",
    property: "",
    source: "",
    status: "",
  })
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([])
  const [availableDocuments, setAvailableDocuments] = useState<Document[]>([])
  const [otherDocuments, setOtherDocuments] = useState<Document[]>([])
  const [showAllSharesModal, setShowAllSharesModal] = useState(false)

  // Fetch lead data from API
  useEffect(() => {
    const fetchLeadData = async () => {
      try {
        const response = await fetch(`https://api.realestatecompany.co.in/api/propertylead/byleadid/${params.id}`, {
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
        // Update recipient info with lead data
        setRecipientInfo((prev) => ({
          ...prev,
          name: data.Name || "",
          phone: data.Mobile || "",
          email: data.Email || "",
          source: data.Source || "",
          property: data.PropertyName || "",
        }))
      } catch (error) {
        console.error("Error fetching lead data:", error)
        toast.error("Failed to load lead information")
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchLeadData()
    }
  }, [params.id, token])

  // Fetch property data when ProjectCode is available
  useEffect(() => {
    if (leadData?.ProjectCode) {
      const fetchPropertyData = async () => {
        try {
          const response = await fetch(`https://api.realestatecompany.co.in/api/properties/${leadData.ProjectCode}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
          if (!response.ok) {
            throw new Error("Failed to fetch property data")
          }
          const data = await response.json()
          setPropertyData(data)
        } catch (error) {
          console.error("Error fetching property data:", error)
          toast.error("Failed to load property information")
        } finally {
          setPropertyLoading(false)
        }
      }

      fetchPropertyData()
    } else {
      setPropertyLoading(false)
    }
  }, [leadData?.ProjectCode, token])

  // Fetch available documents when LeadId is available
  useEffect(() => {
    if (leadData?.ProjectCode) {
      const fetchAvailableDocuments = async () => {
        try {
          setDocumentsLoading(true)
          const response = await fetch(`https://api.realestatecompany.co.in/api/leads/${leadData.LeadId}/documents`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
          if (!response.ok) {
            throw new Error("Failed to fetch available documents")
          }
          const data = await response.json()
          // Transform API response to match our Document interface
          const formattedDocs = data.map((doc: any) => ({
            id: doc.documentId,
            name: doc.documentName,
            type: doc.documentType,
            size: (doc.fileSize / (1024 * 1024)).toFixed(1) + " MB", // Convert bytes to MB
            url: doc.documentUrl,
            uploaded: true,
          }))
          setAvailableDocuments(formattedDocs)
        } catch (error) {
          console.error("Error fetching available documents:", error)
          toast.error("Failed to load available documents")
        } finally {
          setDocumentsLoading(false)
        }
      }

      fetchAvailableDocuments()
    }
  }, [leadData?.ProjectCode, token])

  // Fetch other documents when PropertyId is available
  useEffect(() => {
    if (propertyData?.PropertyId) {
      const fetchOtherDocuments = async () => {
        try {
          setOtherDocumentsLoading(true)
          const response = await fetch(`https://api.realestatecompany.co.in/api/otherdocuments/${propertyData.PropertyId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
          if (!response.ok) {
            throw new Error("Failed to fetch other documents")
          }
          const result = await response.json()

          if (result.success && result.data) {
            // Transform API response to match our Document interface
            const formattedDocs = result.data
              .filter((doc: OtherDocument) => doc.status) // Only show active documents
              .map((doc: OtherDocument) => ({
                id: `other_${doc.id}`,
                name: doc.title,
                type: "PDF", // Assuming most are PDFs, you can enhance this logic
                size: "N/A", // Size not provided in API
                url: doc.docLink,
                uploaded: true,
                logo: doc.logo,
                status: doc.status,
              }))
            setOtherDocuments(formattedDocs)
          }
        } catch (error) {
          console.error("Error fetching other documents:", error)
          toast.error("Failed to load property documents")
        } finally {
          setOtherDocumentsLoading(false)
        }
      }

      fetchOtherDocuments()
    } else {
      setOtherDocumentsLoading(false)
    }
  }, [propertyData?.PropertyId, token])

  const handleDocumentToggle = (docId: string) => {
    // Check in both available documents and other documents
    const doc = [...availableDocuments, ...otherDocuments].find((d) => d.id === docId)
    if (!doc) return

    setSelectedDocuments((prev) => {
      const exists = prev.find((d) => d.id === docId)
      if (exists) {
        return prev.filter((d) => d.id !== docId)
      } else {
        return [...prev, doc]
      }
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const newDoc = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type.split("/")[1]?.toUpperCase() || "FILE",
        size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
        url: "", // Will be set after upload
        uploaded: false,
      }

      setSelectedDocuments((prev) => [...prev, newDoc])

      // Upload file to API
      uploadFile(file, newDoc.id)
    })
  }

  const uploadFile = async (file: File, docId: string) => {
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("leadId", String(leadData?.LeadId || ""))
      formData.append("projectId", leadData?.ProjectCode || "")
      formData.append("documentType", file.type.split("/")[1]?.toUpperCase() || "FILE")

      const response = await fetch(`https://api.realestatecompany.co.in/api/leads/${leadData?.LeadId}/documents/upload/${user?.id}`, {
        method: "POST",
        body: formData, // No Content-Type header needed for FormData
      })

      if (!response.ok) {
        throw new Error("File upload failed")
      }

      const data = await response.json()

      // Update document state
      setSelectedDocuments((prev) =>
        prev.map((doc) =>
          doc.id === docId
            ? {
                ...doc,
                url: data.documentUrl || "", // Changed from data.data?.documentUrl
                uploaded: true,
              }
            : doc,
        ),
      )
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("Failed to upload file")
      setSelectedDocuments((prev) => prev.filter((doc) => doc.id !== docId))
    }
  }

  const handleShareInfo = async () => {
    if (!leadData?.ProjectCode) {
      toast.error("No property selected to share")
      return
    }

    if (shareMethod === "email" && !recipientInfo.email) {
      toast.error("Please enter recipient email")
      return
    }

    if (shareMethod === "whatsapp" && !recipientInfo.phone) {
      toast.error("Please enter recipient phone number")
      return
    }

    try {
      const shareData = {
        projectId: leadData.ProjectCode,
        shareMethod,
        recipientName: recipientInfo.name || "",
        recipientEmail: recipientInfo.email || "",
        recipientPhone: recipientInfo.phone || "",
        customMessage,
        selectedDocuments: selectedDocuments.map((doc) => doc.id), // only IDs, backend builds full objects
        leadId: params.id,
      }

      const response = await fetch(`https://api.realestatecompany.co.in/api/leads/${leadData.LeadId}/share/${user?.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shareData),
      })

      if (!response.ok) {
        throw new Error("Failed to share information")
      }

      toast.success(`Information shared successfully via ${shareMethod}`)
      router.push(`/lead-details/${params.id}`)
    } catch (error) {
      console.error("Error sharing information:", error)
      toast.error("Failed to share information")
    }
  }

  if (loading || propertyLoading || documentsLoading || otherDocumentsLoading) {
    return (
      <AppLayout title="Share Project Information" backUrl={`/lead-details/${params.id}`}>
        <div className="p-4 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    )
  }

  if (!leadData) {
    return (
      <AppLayout title="Share Project Information" backUrl={`/lead-details/${params.id}`}>
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
    <AppLayout title="Share Project Information" backUrl={`/lead-details/${params.id}`}>
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

        {/* Property Information */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-200 p-4 rounded-md shadow-sm space-y-4"
        >
          {propertyData ? (
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start space-x-4 flex-1">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{propertyData.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <FiMapPin className="mr-1" size={14} />
                    {propertyData.location}
                  </div>
                  {Array.isArray(propertyData.bhkOptions) && (
                    <p className="text-sm text-muted-foreground mt-1">{propertyData.bhkOptions.join(", ")}</p>
                  )}
                  <p className="text-sm font-medium text-green-600 mt-1">
                    {propertyData.price} ({propertyData.pricePerSqft}/sq.ft)
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{propertyData.superBuiltUpArea} (Super Built-up)</p>
                </div>
              </div>
              {/* Preview Button */}
              <div className="pt-2">
                <Button size="sm" variant="outline" onClick={() => router.push(`/property/${propertyData.PropertyId}`)}>
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

        {/* Share Options */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Share Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Recipient Name</label>
                <Input
                  value={recipientInfo.name}
                  onChange={(e) => setRecipientInfo((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter recipient name"
                />
              </div>
              <Select value={shareMethod} onValueChange={setShareMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sharing method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  {/* <SelectItem value="sms">SMS</SelectItem> */}
                </SelectContent>
              </Select>
              {shareMethod === "email" && (
                <div>
                  <label className="block text-sm font-medium mb-1">Recipient Email</label>
                  <Input
                    type="email"
                    value={recipientInfo.email}
                    onChange={(e) => setRecipientInfo((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
              )}
              {(shareMethod === "whatsapp" || shareMethod === "sms") && (
                <div>
                  <label className="block text-sm font-medium mb-1">Recipient Phone</label>
                  <Input
                    type="tel"
                    value={recipientInfo.phone}
                    onChange={(e) => setRecipientInfo((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number with country code"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Custom Message</label>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder={`Hi ${recipientInfo.name || "[Name]"}, I wanted to share this property with you...`}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">You can personalize the message that will be sent</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Document Collection */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Collection</CardTitle>
              <p className="text-sm text-muted-foreground">Select documents to include with the property information</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Lead Documents */}
              {availableDocuments.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Lead Documents</h4>
                  <div className="space-y-2">
                    {availableDocuments.map((doc) => {
                      const isSelected = selectedDocuments.some((d) => d.id === doc.id)
                      return (
                        <div
                          key={doc.id}
                          className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                            isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleDocumentToggle(doc.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                              <FiFile className="text-gray-600" size={16} />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.type} • {doc.size}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {isSelected }
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleDocumentToggle(doc.id)}
                              className="rounded"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

          {/* Property Documents */}
{otherDocuments.length > 0 && (
  <div>
    <h4 className="font-medium mb-3">Property Documents</h4>
    <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
      {otherDocuments.map((doc) => {
        const isSelected = selectedDocuments.some((d) => d.id === doc.id)
        return (
          <div
            key={doc.id}
            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
              isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleDocumentToggle(doc.id)}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center">
                {doc.logo ? (
                  <img
                    src={doc.logo}
                    alt={doc.name}
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://www.svgrepo.com/show/5908/text-document.svg";
                    }}
                  />
                ) : (
                  <img 
                    src="https://www.svgrepo.com/show/5908/text-document.svg" 
                    alt="Document" 
                    className="w-6 h-6 object-contain" 
                  />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{doc.name}</p>
                <p className="text-xs text-muted-foreground">{doc.type} • Property Document</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isSelected }
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleDocumentToggle(doc.id)}
                className="rounded"
              />
            </div>
          </div>
        )
      })}
    </div>
  </div>
)}
              {/* Upload New Documents */}
              <div>
                <h4 className="font-medium mb-3">Upload Additional Documents</h4>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FiUpload className="mx-auto text-gray-400 mb-2" size={24} />
                  <p className="text-sm text-muted-foreground mb-2">Drag and drop files here, or click to browse</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button variant="outline" size="sm" onClick={() => document.getElementById("file-upload")?.click()}>
                    Choose Files
                  </Button>
                </div>
              </div>

              
            </CardContent>
          </Card>
        </motion.div>

        {/* Buttons */}
        <div className="space-y-3">
          {/* View All Shares Button */}
          <Button variant="outline" className="w-full bg-transparent" onClick={() => setShowAllSharesModal(true)}>
            <FiList className="mr-2" size={16} />
            View All Shares for this Lead
          </Button>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => router.push(`/lead-details/${params.id}`)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleShareInfo}
              disabled={
                !leadData?.ProjectCode ||
                (shareMethod === "email" && !recipientInfo.email) ||
                (shareMethod !== "email" && !recipientInfo.phone)
              }
            >
              <FiShare2 className="mr-2" size={16} />
              Share Property
            </Button>
          </div>
        </div>

        {/* Get All Shares Modal */}
        <GetAllSharesModal
          isOpen={showAllSharesModal}
          onClose={() => setShowAllSharesModal(false)}
          leadId={params.id}
          leadName={leadData?.Name}
        />
      </div>
    </AppLayout>
  )
}
