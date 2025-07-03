"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function UpdateStatusPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [currentStatus, setCurrentStatus] = useState("Discussion")
  const [newStatus, setNewStatus] = useState("Loan")

  const handleCancel = () => {
    router.push(`/lead-details/${params.id}`)
  }

  const handleUpdate = () => {
    if (currentStatus === newStatus) {
      toast.error("New status must be different from current status")
      return
    }

    toast.success(`Status updated from ${currentStatus} to ${newStatus}`)
    router.push(`/lead-details/${params.id}`)
  }

  return (
    <AppLayout title="Update Status" backUrl={`/lead-details/${params.id}`}>
      <div className="p-4 space-y-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Status</label>
            <Select value={currentStatus} onValueChange={setCurrentStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lead Assigned">Lead Assigned</SelectItem>
                <SelectItem value="Visit Scheduled">Visit Scheduled</SelectItem>
                <SelectItem value="Discussion">Discussion</SelectItem>
                <SelectItem value="Loan">Loan</SelectItem>
                <SelectItem value="Closure">Closure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">New Status</label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lead Assigned">Lead Assigned</SelectItem>
                <SelectItem value="Visit Scheduled">Visit Scheduled</SelectItem>
                <SelectItem value="Discussion">Discussion</SelectItem>
                <SelectItem value="Loan">Loan</SelectItem>
                <SelectItem value="Closure">Closure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={handleCancel}>
              CANCEL
            </Button>

            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleUpdate}>
              UPDATE
            </Button>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  )
}
