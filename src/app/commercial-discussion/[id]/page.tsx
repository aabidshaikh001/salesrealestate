"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { FiHome, FiCreditCard, FiPercent, FiPhone, FiMail, FiList,FiMapPin,FiEye } from "react-icons/fi"
import { FaIndianRupeeSign } from "react-icons/fa6"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BsBuildingsFill } from "react-icons/bs"
import { useAuth } from "@/providers/auth-provider"
import CommercialFinalizationHistoryModal from "../../component/commercial-finalization-history-modal"

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
  images?: string[]
  
}

export default function CommercialDiscussionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, token } = useAuth()
  const [status, setStatus] = useState("In Progress")
  const [leadData, setLeadData] = useState<LeadData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)

  const [commercialData, setCommercialData] = useState({
    finalizedUnit: "",
    unitType: "",
    floorNumber: "",
    finalPrice: "",
    basePrice: "",
    paymentPlan: "",
    downPayment: "",
    emiAmount: "",
    discount: "",
    discountType: "percentage",
    specialOffers: "",
    remarks: "",
  })

  const unitTypes = [
    { value: "1bhk", label: "1 BHK" },
    { value: "2bhk", label: "2 BHK" },
    { value: "3bhk", label: "3 BHK" },
    { value: "4bhk", label: "4 BHK" },
    { value: "penthouse", label: "Penthouse" },
    { value: "studio", label: "Studio Apartment" },
  ]

  const paymentPlans = [
    { value: "construction_linked", label: "Construction Linked Plan" },
    { value: "possession_linked", label: "Possession Linked Plan" },
    { value: "flexi_payment", label: "Flexi Payment Plan" },
    { value: "subvention", label: "Subvention Scheme" },
    { value: "custom", label: "Custom Payment Plan" },
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

        // Try to fetch existing commercial data
        await fetchExistingCommercialData()
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

  const fetchExistingCommercialData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/commercial-finalization/by-lead/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          const data = result.data
          setCommercialData({
            finalizedUnit: data.finalizedUnit || "",
            unitType: data.unitType || "",
            floorNumber: data.floorNumber || "",
            finalPrice: data.finalPrice?.toString() || "",
            basePrice: data.basePrice?.toString() || "",
            paymentPlan: data.paymentPlan || "",
            downPayment: data.downPayment?.toString() || "",
            emiAmount: data.emiAmount?.toString() || "",
            discount: data.discount?.toString() || "",
            discountType: data.discountType || "percentage",
            specialOffers: data.specialOffers || "",
            remarks: data.remarks || "",
          })
          setStatus(data.status || "In Progress")
        }
      }
    } catch (error) {
      console.error("Error fetching existing commercial data:", error)
      // Don't show error toast as this is optional
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setCommercialData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const calculateFinalPrice = () => {
    const basePrice = Number.parseFloat(commercialData.basePrice) || 0
    const discount = Number.parseFloat(commercialData.discount) || 0
    if (basePrice > 0 && discount > 0) {
      let finalPrice = basePrice
      if (commercialData.discountType === "percentage") {
        finalPrice = basePrice - (basePrice * discount) / 100
      } else {
        finalPrice = basePrice - discount
      }
      setCommercialData((prev) => ({ ...prev, finalPrice: finalPrice.toString() }))
    }
  }

  const handleSubmit = async () => {
    if (!commercialData.finalizedUnit || !commercialData.finalPrice || !commercialData.paymentPlan) {
      toast.error("Please fill in all required fields (Unit, Price, Payment Plan)")
      return
    }

    if (!user?.id || !token) {
      toast.error("Authentication required")
      return
    }

    try {
      setSubmitting(true)

      const finalData = {
        LeadId: Number.parseInt(params.id),
        brokerId: user.id,
        ...commercialData,
        status,
        finalPrice: Number.parseFloat(commercialData.finalPrice),
        basePrice: commercialData.basePrice ? Number.parseFloat(commercialData.basePrice) : null,
        downPayment: commercialData.downPayment ? Number.parseFloat(commercialData.downPayment) : null,
        emiAmount: commercialData.emiAmount ? Number.parseFloat(commercialData.emiAmount) : null,
        discount: commercialData.discount ? Number.parseFloat(commercialData.discount) : null,
      }

      const response = await fetch(`${API_BASE_URL}/commercial-finalization`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save commercial details")
      }

      const result = await response.json()

      if (result.success) {
        toast.success("Commercial details finalized successfully!")

        // Send email notification
        try {
          await fetch(`${API_BASE_URL}/commercial-finalization/send-email/${params.id}`, {
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

        router.push(`/loan-assistance/${params.id}`)
      } else {
        throw new Error(result.error || "Failed to save commercial details")
      }
    } catch (error) {
      console.error("Error submitting commercial details:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save commercial details")
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkAsDone = () => {
    setStatus("Done")
    toast.success("Discussion marked as done")
  }

  if (loading) {
    return (
      <AppLayout title="Commercial Finalization" backUrl={`/lead-details/${params.id}`}>
        <div className="p-4 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    )
  }

  if (!leadData) {
    return (
      <AppLayout title="Commercial Finalization" backUrl={`/lead-details/${params.id}`}>
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
    <AppLayout title="Commercial Finalization" backUrl={`/lead-details/${params.id}`}>
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
        
        {/* Discussion Status */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-lg">Finalization Status</h3>
                <span
                  className={`text-sm px-3 py-1 rounded-full font-medium ${
                    status === "Done" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {status}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Finalized Unit Details */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FiHome className="mr-2 text-blue-600" />
                Finalized Unit Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Unit Number <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., A-1201, B-504, Tower-C-801"
                  value={commercialData.finalizedUnit}
                  onChange={(e) => handleInputChange("finalizedUnit", e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Unit Type</label>
                  <Select
                    value={commercialData.unitType}
                    onValueChange={(value) => handleInputChange("unitType", value)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select unit type" />
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
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Floor Number</label>
                  <Input
                    placeholder="e.g., 12th Floor"
                    value={commercialData.floorNumber}
                    onChange={(e) => handleInputChange("floorNumber", e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Price Details */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FaIndianRupeeSign className="mr-2 text-green-600" />
                Price Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Base Price</label>
                <Input
                  placeholder="₹85,00,000"
                  value={commercialData.basePrice}
                  onChange={(e) => handleInputChange("basePrice", e.target.value)}
                  onBlur={calculateFinalPrice}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Final Price <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="₹80,00,000"
                  value={commercialData.finalPrice}
                  onChange={(e) => handleInputChange("finalPrice", e.target.value)}
                  className="h-12 font-semibold text-green-700"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Discount Details */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FiPercent className="mr-2 text-orange-600" />
                Discount & Offers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Discount Amount</label>
                  <Input
                    placeholder="5 or 500000"
                    value={commercialData.discount}
                    onChange={(e) => handleInputChange("discount", e.target.value)}
                    onBlur={calculateFinalPrice}
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Discount Type</label>
                  <Select
                    value={commercialData.discountType}
                    onValueChange={(value) => handleInputChange("discountType", value)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="amount">Fixed Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Special Offers</label>
                <Textarea
                  placeholder="Free car parking, modular kitchen, waiver of registration charges, etc."
                  value={commercialData.specialOffers}
                  onChange={(e) => handleInputChange("specialOffers", e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Plan */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FiCreditCard className="mr-2 text-purple-600" />
                Payment Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Payment Plan <span className="text-red-500">*</span>
                </label>
                <Select
                  value={commercialData.paymentPlan}
                  onValueChange={(value) => handleInputChange("paymentPlan", value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select payment plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentPlans.map((plan) => (
                      <SelectItem key={plan.value} value={plan.value}>
                        {plan.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Down Payment</label>
                  <Input
                    placeholder="₹15,00,000"
                    value={commercialData.downPayment}
                    onChange={(e) => handleInputChange("downPayment", e.target.value)}
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">EMI Amount</label>
                  <Input
                    placeholder="₹45,000/month"
                    value={commercialData.emiAmount}
                    onChange={(e) => handleInputChange("emiAmount", e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Remarks */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Remarks</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Any additional terms, conditions, or special agreements..."
                value={commercialData.remarks}
                onChange={(e) => handleInputChange("remarks", e.target.value)}
                rows={3}
                className="resize-none"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* View History Button */}
          <Button variant="outline" className="w-full bg-transparent" onClick={() => setShowHistoryModal(true)}>
            <FiList className="mr-2" size={16} />
            View Commercial History
          </Button>

          <div className="grid grid-cols-2 gap-4 pb-4">
            <Button
              variant="outline"
              onClick={handleMarkAsDone}
              disabled={status === "Done"}
              className="h-12 font-medium bg-transparent"
            >
              MARK AS DONE
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 h-12 font-medium"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "FINALIZING..." : "FINALIZE DEAL"}
            </Button>
          </div>
        </div>

        {/* Commercial Finalization History Modal */}
        <CommercialFinalizationHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          leadId={params.id}
          leadName={leadData?.Name}
        />
      </div>
    </AppLayout>
  )
}
