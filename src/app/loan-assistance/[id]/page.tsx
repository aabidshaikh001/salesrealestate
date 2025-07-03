"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { FiUpload, FiFileText, FiList } from "react-icons/fi"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BsBuildingsFill } from "react-icons/bs"
import { FiPhone, FiMail,FiMapPin, FiEye } from "react-icons/fi"
import { useAuth } from "@/providers/auth-provider"
import LoanAssistanceHistoryModal from "../../component/loan-assistance-history-modal"

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


}

export default function LoanAssistancePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, token } = useAuth()
  const [bank, setBank] = useState("")
  const [loanStatus, setLoanStatus] = useState("Initiated")
  const [documents, setDocuments] = useState<File[]>([])
  const [notes, setNotes] = useState("")
  const [leadData, setLeadData] = useState<LeadData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)

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

        // Try to fetch existing loan assistance data
        await fetchExistingLoanData()
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

  const fetchExistingLoanData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/loan-assistance/by-lead/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          const data = result.data
          setBank(data.bank || "")
          setLoanStatus(data.loanStatus || "Initiated")
          setNotes(data.notes || "")
        }
      }
    } catch (error) {
      console.error("Error fetching existing loan data:", error)
      // Don't show error toast as this is optional
    }
  }

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newDocs = Array.from(e.target.files)

      // Validate file types
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]

      const validDocs = newDocs.filter((doc) => allowedTypes.includes(doc.type))
      if (validDocs.length !== newDocs.length) {
        toast.error("Only PDF, Word, JPEG, and PNG files are allowed")
        return
      }

      // Validate file sizes (10MB limit)
      const oversizedDocs = validDocs.filter((doc) => doc.size > 10 * 1024 * 1024)
      if (oversizedDocs.length > 0) {
        toast.error("Some files are too large. Maximum size is 10MB per file.")
        return
      }

      // Check total documents limit
      if (documents.length + validDocs.length > 5) {
        toast.error("Maximum 5 documents allowed")
        return
      }

      setDocuments([...documents, ...validDocs])
      toast.success(`${validDocs.length} document(s) added`)
    }
  }

  const removeDocument = (index: number) => {
    const newDocs = documents.filter((_, i) => i !== index)
    setDocuments(newDocs)
    toast.success("Document removed")
  }

  const handleSubmit = async () => {
    if (!bank) {
      toast.error("Please select a partner bank")
      return
    }

    if (!user?.id || !token) {
      toast.error("Authentication required")
      return
    }

    try {
      setSubmitting(true)

      const formData = new FormData()
      formData.append("leadId", params.id)
      formData.append("brokerId", user.id)
      formData.append("bank", bank)
      formData.append("loanStatus", loanStatus)
      formData.append("notes", notes)

      // Append documents
      documents.forEach((doc) => {
        formData.append("documents", doc)
      })

      const response = await fetch(`${API_BASE_URL}/loan-assistance`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save loan assistance details")
      }

      const result = await response.json()

      if (result.success) {
        toast.success("Loan assistance details saved successfully!")

        // Send email notification
        try {
          await fetch(`${API_BASE_URL}/loan-assistance/send-email/${params.id}`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
          toast.success("Email notification sent to client")
        } catch (emailError) {
          console.error("Error sending email:", emailError)
          // Don't fail the main operation if email fails
        }

        router.push(`/closure/${params.id}`)
      } else {
        throw new Error(result.error || "Failed to save loan assistance details")
      }
    } catch (error) {
      console.error("Error submitting loan assistance:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save loan assistance details")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <AppLayout title="Loan Assistance" backUrl={`/lead-details/${params.id}`}>
        <div className="p-4 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    )
  }

  if (!leadData) {
    return (
      <AppLayout title="Loan Assistance" backUrl={`/lead-details/${params.id}`}>
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
    <AppLayout title="Loan Assistance" backUrl={`/lead-details/${params.id}`}>
      <div className="p-4 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-4 bg-gradient-to-r from-yellow-100 to-yellow-200 p-4 rounded-lg shadow-sm"
        >
          <Avatar className="h-16 w-16 border-2 border-primary/10">
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {leadData?.Name?.charAt(0) || "L"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{leadData?.Name}</h2>
            <div className="flex justify-between items-start mt-2">
              <div className="space-y-1">
                {leadData?.Mobile && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FiPhone className="mr-1" size={14} />
                    {leadData?.Mobile}
                  </div>
                )}
                {leadData?.Email && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FiMail className="mr-1" size={14} />
                    {leadData?.Email}
                  </div>
                )}
              </div>
              <div className="flex items-center">
                <p className="text-sm font-medium bg-yellow-100 text-yellow-600 rounded-full p-1">
                  {leadData?.LeadSourceId === 1 ? "Website" : "Other"}
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
            <label className="text-sm font-medium">
              Partner Bank Selection <span className="text-red-500">*</span>
            </label>
            <Select value={bank} onValueChange={setBank}>
              <SelectTrigger>
                <SelectValue placeholder="Select a bank" />
              </SelectTrigger>
              <SelectContent>
                {banks.map((bankOption) => (
                  <SelectItem key={bankOption.value} value={bankOption.value}>
                    {bankOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Loan Status</label>
            <Select value={loanStatus} onValueChange={setLoanStatus}>
              <SelectTrigger>
                <SelectValue />
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

          <div className="space-y-2">
            <p className="text-sm font-medium">Upload Client Documents ({documents.length}/5)</p>
            {documents.length > 0 && (
              <div className="space-y-2 mb-3">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center p-2 bg-muted rounded-md">
                    <FiFileText className="mr-2" />
                    <span className="text-sm truncate flex-1">{doc.name}</span>
                    <span className="text-xs text-muted-foreground mr-2">{(doc.size / 1024).toFixed(0)} KB</span>
                    <button onClick={() => removeDocument(index)} className="text-red-500 hover:text-red-700 text-sm">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 bg-transparent"
              onClick={() => document.getElementById("document-upload")?.click()}
              disabled={documents.length >= 5}
            >
              <FiUpload />
              {documents.length >= 5 ? "MAXIMUM DOCUMENTS REACHED" : "UPLOAD DOCUMENTS"}
              <input
                id="document-upload"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                multiple
                className="hidden"
                onChange={handleDocumentUpload}
              />
            </Button>
            <p className="text-xs text-muted-foreground">
              Maximum 5 documents, 10MB each. Supported: PDF, Word, JPEG, PNG
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Follow-up Notes</label>
            <Textarea
              placeholder="Add follow-up notes, loan requirements, special instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* View History Button */}
          <Button variant="outline" className="w-full bg-transparent" onClick={() => setShowHistoryModal(true)}>
            <FiList className="mr-2" size={16} />
            View Loan Assistance History
          </Button>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={submitting || !bank}
          >
            {submitting ? "SAVING..." : "CONTINUE"}
          </Button>
        </motion.div>

        {/* Loan Assistance History Modal */}
        <LoanAssistanceHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          leadId={params.id}
          leadName={leadData?.Name}
          onUpdate={(updatedData) => {
            setBank(updatedData.bank)
            setLoanStatus(updatedData.loanStatus)
            setNotes(updatedData.notes)
            toast.success("Data updated from history")
          }}
        />
      </div>
    </AppLayout>
  )
}
