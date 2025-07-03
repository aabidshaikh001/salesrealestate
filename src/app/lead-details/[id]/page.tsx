"use client";
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FiPhone, FiFileText, FiMapPin, FiHome, FiMail, FiPlus,FiEye } from "react-icons/fi"
import { BsBuildingsFill } from "react-icons/bs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProgressTracker } from "@/components/progress-tracker"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LuIndianRupee } from "react-icons/lu"
import { useAuth } from "@/providers/auth-provider"
import { toast } from "sonner"
import { AppLayout } from "@/components/app-layout"

interface LeadDetails {
  LeadId: number
  LeadName: string
  LeadMobile: string
  Email: string
  LeadCode: string
  PropertyName?: string
  StatusName?: string
  Source?: string
  AssignedBy?: string
  AssignedDate?: string
  AssignedRemark?: string
  notes: string[]
  ProjectCode: string
  activities: Activity[]
}
interface Property{
 PropertyId: string
  title: string
  location: string
  price: string
  pricePerSqft: string
  superBuiltUpArea: string
  bhkOptions: string[]
  images?: string[]
  PropertyType: string
  
}
interface Activity {
  type: string
  description: string
  date: string
  time: string
}

export default function LeadDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, token } = useAuth()
  const [lead, setLead] = useState<LeadDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [propertyData, setPropertyData] = useState<Property | null>(null)
  const [propertyLoading, setPropertyLoading] = useState(true)

  useEffect(() => {
    const fetchLeadDetails = async () => {
      if (!user?.id || !token) {
        setError("Authentication required")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // First fetch lead assignment details
        const assignmentResponse = await fetch(
          `https://api.realestatecompany.co.in/api/lead-assignment/user/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )

        if (!assignmentResponse.ok) {
          throw new Error("Failed to fetch lead assignment details")
        }

        const assignments = await assignmentResponse.json()
        const currentAssignment = assignments.find(
          (assignment: any) => assignment.LeadId === parseInt(params.id)
        )

        if (!currentAssignment) {
          throw new Error("Lead not assigned to current user")
        }

        // Then fetch lead details
        const leadResponse = await fetch(
          `https://api.realestatecompany.co.in/api/propertylead/byleadid/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )

        if (!leadResponse.ok) {
          throw new Error("Failed to fetch lead details")
        }

        const leadData = await leadResponse.json()

        // Combine data
        const combinedData = {
          ...currentAssignment,
          ...leadData,
          notes: leadData.notes || [],
          activities: leadData.activities || [],
        }

        setLead(combinedData)
      } catch (err) {
        console.error("API Error:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchLeadDetails()
  }, [params.id, user, token])

useEffect(() => {
    if (lead?.ProjectCode) {
      const fetchPropertyData = async () => {
        try {
          const response = await fetch(`https://api.realestatecompany.co.in/api/properties/${lead.ProjectCode}`, {
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
  }, [lead?.ProjectCode, token])


  const handleScheduleVisit = () => {
    router.push(`/schedule-visit/${params.id}`)
  }

  const handleStartDiscussion = () => {
    router.push(`/commercial-discussion/${params.id}`)
  }

  const handleAddNotes = () => {
    router.push(`/add-notes/${params.id}`)
  }

  const handleUpdateStatus = () => {
    router.push(`/update-status/${params.id}`)
  }

  const closure = () => {
    router.push(`/closure/${params.id}`)
  }

  const loans = () => {
    router.push(`/loan-assistance/${params.id}`)
  }

  const sitevisit = () => {
    router.push(`/site-visit-feedback/${params.id}`)
  }

  const sharesiteinfo = () => {
    router.push(`/share-site-info/${params.id}`)
  }

  const leadverification = () => {
    router.push(`/lead-verification/${params.id}`)
  }

  const personalmeeting = () => {
    router.push(`/personal-meeting/${params.id}`)
  }

  const meetingsnotes = () => {
    router.push(`/meetingsnotes/${params.id}`)
  }
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  if (error && !lead) {
    return (
      <div className="p-4 text-red-500">
        <p>Error loading lead: {error}</p>
        <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="p-4 text-center py-8">
        <p>Lead not found</p>
      </div>
    )
  }

  return (
    <AppLayout title={`Lead Details`} backUrl="/leads">
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <motion.div
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex items-start gap-4 bg-gradient-to-r from-yellow-100 to-yellow-200 p-4 rounded-lg shadow-sm"
               >
                 <Avatar className="h-16 w-16 border-2 border-primary/10">
                   <AvatarFallback className="bg-primary/10 text-primary text-xl">
                     {lead.LeadName?.charAt(0) || "L"}
                   </AvatarFallback>
                 </Avatar>
                 <div className="flex-1">
                   <h2 className="text-xl font-bold">{lead.LeadName}</h2>
                   <div className="flex justify-between items-start mt-2">
                     <div className="space-y-1">
                       {lead.LeadMobile && (
                         <div className="flex items-center text-sm text-muted-foreground">
                           <FiPhone className="mr-1" size={14} />
                           {lead.LeadMobile}
                         </div>
                       )}
                       {lead.Email && (
                         <div className="flex items-center text-sm text-muted-foreground">
                           <FiMail className="mr-1" size={14} />
                           {lead.Email}
                         </div>
                       )}
                     </div>
                     <div className="flex items-center">
                       <p className="text-sm font-medium bg-yellow-100 text-yellow-600 rounded-full p-1">
                         {lead.Source || "Unknown Source"}
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
                       {propertyData ? (
                         <div className="flex items-start justify-between gap-4">
                           <div className="flex items-start space-x-4 flex-1">
                             <div className="flex-1">
                               <h3 className="font-semibold text-lg">{propertyData.title}</h3>
                               <div className="flex items-center text-sm text-muted-foreground mt-1">
                                 <FiMapPin className="mr-1" size={14} />
                                 {propertyData.location}
                               </div>
                              
                               <p className="text-sm font-medium text-green-600 mt-1">
                                 {propertyData.price} ({propertyData.pricePerSqft}/sq.ft)
                               </p>
                               <p className="text-sm text-muted-foreground mt-1">
                                 {propertyData.superBuiltUpArea} (Super Built-up)
                               </p>
                             </div>
                           </div>
                     
                           {/* Preview Button */}
                           <div className="pt-2">
                             <Button
                               size="sm"
                               variant="outline"
                               onClick={() => router.push(`/property/${propertyData.PropertyId}`)}
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
              
        <Tabs defaultValue="actions" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="actions" className="mt-4">
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              {/* LEAD VERIFICATION & SHARE SITE INFO - Green */}
              <motion.div variants={item}>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={leadverification}
                    className="w-full bg-green-600 hover:bg-green-700 text-white h-12 rounded-xl shadow-sm text-xs font-medium"
                  >
                    LEAD VERIFICATION
                  </Button>
                  <Button
                    onClick={sharesiteinfo}
                    className="w-full bg-green-600 hover:bg-green-700 text-white h-12 rounded-xl shadow-sm text-xs font-medium"
                  >
                    SHARE SITE INFO
                  </Button>
                </div>
              </motion.div>

             
              {/* SCHEDULE SITE VISIT & SITE VISIT - Blue */}
              <motion.div variants={item}>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl shadow-sm text-xs font-medium"
                    onClick={handleScheduleVisit}
                  >
                    SCHEDULE SITE VISIT
                  </Button>
                  <Button
                    onClick={sitevisit}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl shadow-sm text-xs font-medium"
                  >
                    SITE VISIT
                  </Button>
                </div>
              </motion.div>
               {/* PERSONAL MEETING - Red */}
              <motion.div variants={item}>
                  <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={personalmeeting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white h-12 rounded-xl shadow-sm text-sm font-medium"
                >
                  SCHEDULE MEETING
                </Button>
                <Button
                  onClick={meetingsnotes}
                  className="w-full bg-red-600 hover:bg-red-700 text-white h-12 rounded-xl shadow-sm text-sm font-medium"
                >
                  MEETINGS NOTES
                </Button>

                </div>
              </motion.div>


              {/* COMMERCIALS & LOANS (OPTIONAL) - Blue */}
              <motion.div variants={item}>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl shadow-sm text-xs font-medium"
                    onClick={handleStartDiscussion}
                  >
                    COMMERCIALS
                  </Button>
                  <Button
                    onClick={loans}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl shadow-sm text-xs font-medium"
                  >
                    LOANS (OPTIONAL)
                  </Button>
                </div>
              </motion.div>

              {/* CLOSURE - Red */}
              <motion.div variants={item}>
                <Button
                  className="w-full bg-red-600 hover:bg-red-700 text-white h-12 rounded-xl shadow-sm text-sm font-medium"
                  onClick={closure}
                >
                  CLOSURE
                </Button>
              </motion.div>
            </motion.div>
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <div className="space-y-3">
              {/* Add Notes Button */}
              <Button
                onClick={handleAddNotes}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <FiPlus className="h-4 w-4" />
                ADD NOTES
              </Button>

              {/* Existing Notes */}
              {lead.notes.length > 0 ? (
                <div className="space-y-3">
                  {lead.notes.map((note, index) => (
                    <Card key={index} className="bg-white border-gray-200">
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-700">{note}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-white rounded-lg">
                  <FiFileText className="mx-auto h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-gray-500">No notes yet</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {lead.activities.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-muted">
                {lead.activities.map((activity, index) => (
                  <div key={index} className="relative">
                    <div className="absolute left-[-22px] top-0 h-4 w-4 rounded-full bg-blue-500"></div>
                    <Card className="overflow-hidden border-none shadow-sm">
                      <CardContent className="p-4">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.date} at {activity.time}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <FiFileText className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">No activity history yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}