"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface PropertyData {
  projectId?: string
}

interface ProjectData {
  projectDescription?: string
  builderId?: string
  // Add other fields as needed
}

interface PropertyAboutProps {
  propertyId: string
  onBuilderIdChange?: (builderId: string) => void
}

export default function PropertyAbout({ propertyId, onBuilderIdChange }: PropertyAboutProps) {
  const router = useRouter()
  const [aboutData, setAboutData] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        // Step 1: Fetch property data to get projectId
        const propertyResponse = await fetch(
          `https://api.realestatecompany.co.in/api/properties/${propertyId}`
        )

        if (!propertyResponse.ok) throw new Error("Property not found")

        const propertyResponseData = await propertyResponse.json()
        const propertyData: PropertyData = propertyResponseData.data || propertyResponseData

        if (!propertyData.projectId) {
          setError("No project associated with this property.")
          setAboutData("No description available.")
          return
        }

        // Step 2: Fetch project details using projectId
        const projectResponse = await fetch(
          `https://api.realestatecompany.co.in/api/aboutproject/${propertyData.projectId}`
        )
        if (!projectResponse.ok) throw new Error("Project not found")

        const projectResponseData = await projectResponse.json()
        const projectData: ProjectData = projectResponseData.data

      const description =
  (typeof projectData.projectDescription === "string"
    ? projectData.projectDescription.slice(0, 200)
    : "No description available.") + "...";
setAboutData(description);

        // Notify parent component about builderId
        if (onBuilderIdChange && projectData.builderId) {
          onBuilderIdChange(projectData.builderId)
        }
      } catch (err) {
        console.error("Error fetching project details:", err)
        setError("Failed to load project details.")
        setAboutData("No description available.")
      } finally {
        setLoading(false)
      }
    }

    fetchProjectDetails()
  }, [propertyId, onBuilderIdChange])

  const handleViewDetails = () => {
    router.push(`/About-Project/${propertyId}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="p-4 border-b"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">About the Project</h3>
        <button onClick={handleViewDetails} className="text-red-500 text-sm">
          View Details
        </button>
      </div>

      {loading && <p className="text-sm text-gray-600">Loading...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {!loading && !error && <p className="text-sm text-gray-600">{aboutData}</p>}
    </motion.div>
  )
}
