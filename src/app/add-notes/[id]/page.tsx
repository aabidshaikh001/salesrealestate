"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AddNotesPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [activityType, setActivityType] = useState("Follow-Up")
  const [nextAction, setNextAction] = useState("Site Visit")
  const [comments, setComments] = useState("")

  const handleSave = () => {
    if (!comments) {
      toast.error("Please add comments")
      return
    }

    toast.success("Notes added successfully")
    router.push(`/lead-details/${params.id}`)
  }

  return (
   <AppLayout title="Add Notes" backUrl={`/lead-details/${params.id}`}>
      <div className="p-4 space-y-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Act Type</label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Follow-Up">Follow-Up</SelectItem>
                <SelectItem value="Site Visit">Site Visit</SelectItem>
                <SelectItem value="Discussion">Discussion</SelectItem>
                <SelectItem value="Loan">Loan</SelectItem>
                <SelectItem value="Closure">Closure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Next Action</label>
            <Select value={nextAction} onValueChange={setNextAction}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Site Visit">Site Visit</SelectItem>
                <SelectItem value="Follow-Up">Follow-Up</SelectItem>
                <SelectItem value="Discussion">Discussion</SelectItem>
                <SelectItem value="Loan">Loan</SelectItem>
                <SelectItem value="Closure">Closure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Comments</label>
            <Textarea
              placeholder="Add your comments..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={5}
            />
          </div>

          <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
            SAVE
          </Button>
        </motion.div>
      </div>
      </AppLayout>
  
  )
}
