"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { FiHome } from "react-icons/fi"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FiPhone, FiMail, FiMapPin,FiEye } from "react-icons/fi"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { BsBuildingsFill } from "react-icons/bs"

interface LeadData {
  LeadId: number;
  Name: string;
  Phone?: string;
  Mobile?: string;
  Email?: string;
  Address1?: string;
  Address2?: string;
  City?: string;
  State?: string;
  PinNo?: number;
  Country?: string;
  MinBudget?: string;
  MaxBudget?: string;
  Funding?: string;
  Occupation?: string;
  Uses?: string;
  TimeFrame?: string;
  SearchingFor?: string;
  OtherInvestments?: string;
  ProjectCode?: string;
  LeadSourceId?: number;
  LeadTypeId?: number;
  REMCategoryCode?: string;
  REMPropTagCode?: string;
  LeadDesc?: string;
}

interface Property{
 PropertyId: string
  title: string
  location: string
  price: string
  pricePerSqft: string
  superBuiltUpArea: string
  bhkOptions: string[]

}

export default function LeadVerificationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [verificationData, setVerificationData] = useState({
    phoneVerified: false,
    emailVerified: false,
  })
  const [leadData, setLeadData] = useState<LeadData>({
    LeadId: 0,
    Name: "",
  })
  const [verificationNotes, setVerificationNotes] = useState("")
  const [verificationStatus, setVerificationStatus] = useState("pending")
  const [property, setProperty] = useState<Property | null>(null)

  useEffect(() => {
    const fetchLeadData = async () => {
      try {
        const response = await fetch(`https://api.realestatecompany.co.in/api/propertylead/byleadid/${params.id}`)
        if (!response.ok) throw new Error("Failed to fetch lead data")
        const data = await response.json()
        setLeadData(data)
      } catch (error) {
        console.error("Error fetching lead data:", error)
        toast.error("Failed to load lead data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchLeadData()
  }, [params.id])

  useEffect(() => {
  const fetchProperty = async () => {
    if (!leadData.ProjectCode) return

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
}, [leadData.ProjectCode])




  const handleVerificationChange = (field: string, value: boolean) => {
    setVerificationData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleInputChange = (field: keyof LeadData, value: string) => {
    setLeadData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleVerifyPhone = () => {
    setTimeout(() => {
      handleVerificationChange("phoneVerified", true)
      toast.success("Phone number verified successfully")
    }, 1000)
  }

  const handleVerifyEmail = () => {
    setTimeout(() => {
      handleVerificationChange("emailVerified", true)
      toast.success("Email verified successfully")
    }, 1000)
  }

  const handleCompleteVerification = async () => {
    const verifiedCount = Object.values(verificationData).filter(Boolean).length
    const totalChecks = Object.keys(verificationData).length

    if (verifiedCount < totalChecks * 0.7) {
      toast.error("Please complete at least 70% of verification checks")
      return
    }

    try {
      const updateData = {
        ...leadData,
        VerificationNotes: verificationNotes,
        REMPropStatusCode: "PS-0002", // Mark as verified
        TranByUpdate: "Verification System"
      }

      const response = await fetch(`https://api.realestatecompany.co.in/api/propertylead/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) throw new Error("Failed to update lead")

      const result = await response.json()
      if (result.success) {
        setVerificationStatus("completed")
        toast.success("Lead verification completed successfully")
        router.push(`/lead-details/${params.id}`)
      } else {
        throw new Error(result.error || "Failed to update lead")
      }
    } catch (error) {
      console.error("Error updating lead:", error)
      toast.error("Failed to complete verification")
    }
  }

  const verificationItems = [
    { key: "phoneVerified", label: "Phone Number", icon: FiPhone, action: handleVerifyPhone },
    { key: "emailVerified", label: "Email Address", icon: FiMail, action: handleVerifyEmail },
  ]

  if (isLoading) {
    return (
      <AppLayout title="Lead Verification" backUrl={`/lead-details/${params.id}`}>
        <div className="p-4">Loading lead data...</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Lead Verification" backUrl={`/lead-details/${params.id}`}>
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
           
   


        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lead Information</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    value={leadData.Mobile || ""}
                    onChange={(e) => handleInputChange("Mobile", e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    value={leadData.Email || ""}
                    onChange={(e) => handleInputChange("Email", e.target.value)}
                    placeholder="Enter email address"
                    type="email"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Address</label>
                <Input
                  value={leadData.Address1 || ""}
                  onChange={(e) => handleInputChange("Address1", e.target.value)}
                />
              </div>
              <div>
                <Input
                  value={leadData.Address2 || ""}
                  onChange={(e) => handleInputChange("Address2", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">City</label>
                  <Input 
                    value={leadData.City || ""} 
                    onChange={(e) => handleInputChange("City", e.target.value)} 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">State</label>
                  <Input 
                    value={leadData.State || ""} 
                    onChange={(e) => handleInputChange("State", e.target.value)} 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">PIN</label>
                  <Input
                    value={leadData.PinNo?.toString() || ""}
                    onChange={(e) => handleInputChange("PinNo", e.target.value)}
                    type="number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Country</label>
                  <Input
                    value={leadData.Country || ""}
                    onChange={(e) => handleInputChange("Country", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Min Budget</label>
                  <Input
                    value={leadData.MinBudget || ""}
                    onChange={(e) => handleInputChange("MinBudget", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Budget</label>
                  <Input
                    value={leadData.MaxBudget || ""}
                    onChange={(e) => handleInputChange("MaxBudget", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Funding</label>
                  <Select 
                    value={leadData.Funding || ""} 
                    onValueChange={(value) => handleInputChange("Funding", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select funding source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self_funding">Self Funding</SelectItem>
                      <SelectItem value="loan">Loan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Occupation</label>
                  <Select
                    value={leadData.Occupation || ""}
                    onValueChange={(value) => handleInputChange("Occupation", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select occupation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self_employed">Self Employed</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Uses</label>
                  <Select 
                    value={leadData.Uses || ""} 
                    onValueChange={(value) => handleInputChange("Uses", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select usage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self_user">Self User</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                      <SelectItem value="recurring_income">Recurring Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Time Frame</label>
                  <Select
                    value={leadData.TimeFrame || ""}
                    onValueChange={(value) => handleInputChange("TimeFrame", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time frame" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1_week">1 Week</SelectItem>
                      <SelectItem value="1_month">1 Month</SelectItem>
                      <SelectItem value="3_months">3 Months</SelectItem>
                      <SelectItem value="6_months">6 Months</SelectItem>
                      <SelectItem value="1_year">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Search For</label>
                  <Select
                    value={leadData.SearchingFor || ""}
                    onValueChange={(value) => handleInputChange("SearchingFor", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select search purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yourself">Yourself</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Other Investments</label>
                  <Input
                    value={leadData.OtherInvestments || ""}
                    onChange={(e) => handleInputChange("OtherInvestments", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Verification Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {verificationItems.map((item, index) => {
                const hasValue =
                  item.key === "phoneVerified"
                    ? !!leadData.Mobile
                    : item.key === "emailVerified"
                      ? !!leadData.Email
                      : false
                const isVerified = verificationData[item.key as keyof typeof verificationData] || hasValue

                return (
                  <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{item.label}</span>
                      {hasValue && (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Value provided</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.action && (
                        <Button size="sm" variant="outline" onClick={item.action} disabled={isVerified}>
                          {isVerified ? "Verified" : "Verify"}
                        </Button>
                      )}
                      <Checkbox
                        checked={isVerified}
                        onCheckedChange={(checked) => handleVerificationChange(item.key, checked as boolean)}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Verification Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add any verification notes or observations..."
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => router.push(`/lead-details/${params.id}`)}>
            Cancel
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700" 
            onClick={handleCompleteVerification}
            disabled={verificationStatus === "completed"}
          >
            {verificationStatus === "completed" ? "VERIFIED" : "COMPLETE VERIFICATION"}
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}