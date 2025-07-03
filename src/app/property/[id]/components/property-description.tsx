"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"

interface PropertyDescriptionProps {
  propertyId: string
}

interface PropertyDetails {
  description: string
}

export default function PropertyDescription({ propertyId }: PropertyDescriptionProps) {
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch(`https://api.realestatecompany.co.in/api/properties/${propertyId}`)
        if (!response.ok) throw new Error("Failed to fetch property details")

        const data = await response.json()

        const details: PropertyDetails = {
          description:
            data.description ||
            "This beautiful property offers modern living with excellent connectivity and premium amenities. Located in a prime area with easy access to schools, hospitals, and shopping centers. The property features contemporary design with high-quality finishes and spacious layouts perfect for comfortable living. The development boasts world-class infrastructure and is designed to provide a luxurious lifestyle with all modern conveniences at your doorstep.",
        }

        setPropertyDetails(details)
      } catch (error) {
        console.error("Error fetching property details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPropertyDetails()
  }, [propertyId])

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  }

  const expandVariants = {
    collapsed: { height: 0, opacity: 0 },
    expanded: {
      height: "auto",
      opacity: 1,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.3, delay: 0.1 },
      },
    },
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!propertyDetails) {
    return <div className="p-4 text-center text-gray-500">Unable to load property description</div>
  }

  // Show preview (first 150 characters) when collapsed
  const previewText = propertyDetails.description.slice(0, 150)
  const shouldShowToggle = propertyDetails.description.length > 150

  return (
    <motion.div className="p-4 border-b" variants={containerVariants} initial="hidden" animate="visible">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Description</h3>

        <div className="text-gray-600 leading-relaxed">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            {isExpanded ? propertyDetails.description : `${previewText}${shouldShowToggle ? "..." : ""}`}
          </motion.p>
        </div>

        {shouldShowToggle && (
          <motion.button
            onClick={toggleExpanded}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-sm font-medium">{isExpanded ? "Show Less" : "Read More"}</span>
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
