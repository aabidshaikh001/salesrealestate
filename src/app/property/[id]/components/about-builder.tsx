"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ChevronRight, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

interface BuilderData {
  builderId: number
  name: string
  established: string
  logo: string
  overview: string
  experience: string
  certifications: string
  headOffice: string
  contactEmail: string
  contactPhone: string
  website: string
  socialLinks: string
  status: string
}

interface PropertyData {
  propertyId: string
  projectId: number
  // other property fields
}

interface ProjectData {
  projectId: number
  builderId: number
  // other project fields
}

interface AboutBuilderProps {
  propertyId: string
}

export function AboutBuilder({ propertyId }: AboutBuilderProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [builder, setBuilder] = useState<BuilderData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBuilderDetails() {
      setLoading(true)
      setError(null)
      setBuilder(null)

      try {
        // Step 1: Fetch Property to get projectId
        const propertyResponse = await fetch(`https://api.realestatecompany.co.in/api/properties/${propertyId}`)
        if (!propertyResponse.ok) throw new Error("Property not found")
        const propertyData: PropertyData = await propertyResponse.json()

        if (!propertyData.projectId) {
          setError("No project associated with this property.")
          return
        }

        // Step 2: Fetch Project to get builderId
        const projectResponse = await fetch(`https://api.realestatecompany.co.in/api/aboutproject/${propertyData.projectId}`)
        if (!projectResponse.ok) throw new Error("Project not found")
        const projectRes = await projectResponse.json()
        const projectData: ProjectData = projectRes.data

        if (!projectData.builderId) {
          setError("No builder associated with this project.")
          return
        }

        // Step 3: Fetch Builder Details
        const builderResponse = await fetch(`https://api.realestatecompany.co.in/api/builderdetails/${projectData.builderId}`)
        if (!builderResponse.ok) throw new Error("Builder not found")
        const builderData: BuilderData = await builderResponse.json()

        setBuilder(builderData)
      } catch (err) {
        console.error("Error fetching builder details:", err)
        setError("Failed to load builder details.")
      } finally {
        setLoading(false)
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
          aria-expanded={isExpanded}
          aria-controls="builder-description"
        >
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </CardHeader>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id="builder-description"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="px-4 pb-4">
              {loading && <p className="text-gray-400 text-sm">Loading builder details...</p>}
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {!loading && !error && builder && (
                <>
                  <p className="text-gray-600 text-sm leading-relaxed">{builder.overview || "No details available."}</p>
                  <Link href={`/builder/${builder.builderId}`}>
                    <Button variant="link" className="text-blue-600 font-semibold p-0 h-auto mt-2">
                      View Full Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
