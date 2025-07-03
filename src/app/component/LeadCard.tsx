"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FiPhone, FiMail } from "react-icons/fi"
import { BsBuildingsFill } from "react-icons/bs"

interface Lead {
  name: string
  phone: string
  email?: string
  source: string
  property: string
}

export function LeadCard({ lead }: { lead: Lead }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4 bg-gradient-to-r from-yellow-100 to-yellow-200 p-4 rounded-lg shadow-sm"
      >
        <Avatar className="h-16 w-16 border-2 border-primary/10">
          <AvatarFallback className="bg-primary/10 text-primary text-xl">
            {lead.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h2 className="text-xl font-bold">{lead.name}</h2>
          <div className="flex justify-between items-start mt-2">
            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <FiPhone className="mr-1" size={14} />
                {lead.phone}
              </div>
              {lead.email && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <FiMail className="mr-1" size={14} />
                  {lead.email}
                </div>
              )}
            </div>

            <div className="flex items-center">
              <p className="text-sm font-medium bg-yellow-100 text-yellow-600 rounded-full p-1">
                {lead.source}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex items-center space-x-2 mt-2">
        <BsBuildingsFill size={14} />
        <p className="text-sm font-medium bg-yellow-100 text-yellow-600 rounded-full p-1">
          {lead.property}
        </p>
      </div>
    </>
  )
}
