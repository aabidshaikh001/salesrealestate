"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FiSearch, FiFilter } from "react-icons/fi"
import { AppLayout } from "@/components/app-layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/providers/auth-provider"
import { toast } from "sonner"
import ProtectedRoute from "@/providers/ProtectedRoute"

interface AssignedLead {
  AssignmentId: number
  UserId: string
  LeadId: number
  AssignedBy: string
  AssignedDate: string
  AssignedRemark: string | null
  RevokedBy: string | null
  RevokeDate: string | null
  RevokeRemark: string | null
  IsActive: boolean
  LeadName: string
  LeadMobile: string
  Email: string
  LeadCode: string
  PropertyId: string
  status?: string
  Source?: string
  createdAt?: string
  PropertyName?: string
  StatusName?: string
}

export default function AssignedLeadsPage() {
  const router = useRouter()
  const { user, token } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [leads, setLeads] = useState<AssignedLead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAssignedLeads = async () => {
      if (!user?.id || !token) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`https://api.realestatecompany.co.in/api/lead-assignment/user/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) throw new Error("Failed to fetch assigned leads")

        const data = await response.json()
        console.log("Assigned Leads Data:", data)
        setLeads(data)
      } catch (err) {
        console.error("API error:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        toast.error("Failed to load assigned leads")
      } finally {
        setLoading(false)
      }
    }

    fetchAssignedLeads()
  }, [user, token])

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.LeadName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.LeadMobile?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.status?.toLowerCase().includes(searchQuery.toLowerCase())

    let matchesStatus = true
    if (statusFilter !== "all") {
      matchesStatus = lead.status?.toLowerCase().replace(/\s+/g, '') === statusFilter
    }

    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const handleLeadClick = (leadId: number) => {
    router.push(`/lead-details/${leadId}`)
  }

  if (!user) {
    return (
      <AppLayout title="Assigned Leads" backUrl="/dashboard">
        <div className="p-4 text-center py-8">
          <p>You need to be logged in to view assigned leads</p>
          <Button className="mt-4" onClick={() => router.push("/login")}>
            Login
          </Button>
        </div>
      </AppLayout>
    )
  }

  if (loading) {
    return (
      <AppLayout title="Assigned Leads" backUrl="/dashboard">
        <div className="p-4 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <ProtectedRoute>
      <AppLayout title="Assigned Leads" backUrl="/dashboard">
        <div className="p-4 space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon">
              <FiFilter />
            </Button>
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-2">
            <Select>
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(new Set(leads.map((lead) => lead.PropertyId))).map((project) => (
                  <SelectItem key={project} value={project}>
                    {project}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="newlead">New Lead</SelectItem>
                <SelectItem value="visitscheduled">Visit Scheduled</SelectItem>
                <SelectItem value="discussion">Discussion</SelectItem>
                <SelectItem value="loan">Loan</SelectItem>
                <SelectItem value="closure">Closure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filteredLeads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {leads.length === 0 ? "No leads assigned to you yet" : "No leads match your filters"}
              </div>
            ) : (
              filteredLeads.map((lead, index) => (
                <motion.div
                  key={lead.LeadId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleLeadClick(lead.LeadId)}
                >
                  <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-light">
                            {lead.AssignedDate ? formatDate(lead.AssignedDate) : "Date not available"}
                          </h3>
                          <h3 className="font-medium">{lead.LeadName}</h3>
                          <p className="text-sm text-muted-foreground">{lead.LeadMobile}</p>
                          {lead.Email && <p className="text-sm text-muted-foreground">{lead.Email}</p>}
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                lead.Source === "Website"
                                  ? "text-yellow-600 bg-yellow-100"
                                  : lead.Source === "Referral"
                                  ? "text-rose-600 bg-rose-100"
                                  : lead.Source === "Social Media"
                                  ? "text-fuchsia-600 bg-fuchsia-100"
                                  : "text-cyan-600 bg-cyan-100"
                              }`}
                            >
                              {lead.Source || "Unknown"}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                lead.StatusName === "New"
                                  ? "bg-blue-100 text-blue-800"
                                  : lead.StatusName === "Assigned"
                                  ? "bg-purple-100 text-purple-800"
                                  : lead.StatusName === "Inprocess"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : lead.StatusName === "Closed"
                                  ? "bg-orange-100 text-orange-800"
                                  : lead.StatusName === "Cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                                
                              }`}
                            >
                              {lead.StatusName || "Unknown"}
                            </span>
                          </div>
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">
                              {lead.PropertyName || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}
