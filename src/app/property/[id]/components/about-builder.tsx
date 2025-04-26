"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ChevronRight, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useEffect } from "react"

interface AboutBuilderProps {
  propertyId: string
}



export function AboutBuilder({ propertyId }: AboutBuilderProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [builderDescription, setBuilderDescription] = useState<string>("")
 
  
  useEffect(() => {
    const fetchBuilderDetails = async () => {
    
      try {
     
        const response = await fetch(`http://localhost:5000/api/builderdetails/${propertyId}`)
     
        if (!response.ok) throw new Error("Failed to fetch builder details")
        const data = await response.json()
        setBuilderDescription(data?.overview || "No details available.")
      } catch (error) {
        console.error("Error fetching builder details:", error)
      }
     
    }
  
    fetchBuilderDetails()
  }, [propertyId])

 

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="flex-row items-center justify-between pb-2 pt-4 px-4">
        <h2 className="text-lg font-bold">About the Builder</h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-600 font-semibold p-1 h-auto"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </CardHeader>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="px-4 pb-4">
              <p className="text-gray-600 text-sm leading-relaxed">{builderDescription}</p>
              <Link href={`/builder/${propertyId}`}>
                <Button variant="link" className="text-blue-600 font-semibold p-0 h-auto mt-2">
                  View Full Details
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

