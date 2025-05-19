"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import Image from "next/image"

interface PropertyAmenitiesProps {
  propertyId: string
}

interface Amenity {
  icon: string
  iconKey?: string
  label: string
}

// Helper component to render the appropriate icon
const AmenityIcon = ({ icon }: { icon: string }) => {
  // Check if icon is an image URL
  if (icon && (icon.startsWith("http") || icon.startsWith("/"))) {
    return (
      <div className="relative w-8 h-8">
        <Image
          src={icon || "/placeholder.svg"}
          alt="Amenity icon"
          width={32}
          height={32}
          className="object-contain"
          onError={(e) => {
            // Fallback to a default icon if image fails to load
            e.currentTarget.src = "/placeholder.svg?height=32&width=32"
          }}
        />
      </div>
    )
  }

  // Otherwise render as text/emoji
  return <span className="text-2xl">{icon || "🏠"}</span>
}

export default function PropertyAmenities({ propertyId }: PropertyAmenitiesProps) {
  const router = useRouter()
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const response = await fetch(`https://api.realestatecompany.co.in/api/amenities/${propertyId}`)
        if (!response.ok) throw new Error("Failed to fetch")
        const data: Amenity[] = await response.json()
        setAmenities(data)
      } catch (error) {
        console.error("Error fetching amenities:", error)
        setAmenities([])
      } finally {
        setLoading(false)
      }
    }

    fetchAmenities()
  }, [propertyId])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  // Show only first 8 amenities in preview
  const previewAmenities = amenities.slice(0, 8)

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-4 border-b">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Project Amenities</h3>
      </div>

      {loading ? (
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex flex-col items-center animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full mb-1"></div>
              <div className="h-3 w-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : previewAmenities.length > 0 ? (
        <div className="grid grid-cols-4 gap-4">
          {previewAmenities.map((amenity, index) => (
            <motion.div key={index} variants={itemVariants} className="flex flex-col items-center">
              <div className="w-12 h-12 flex items-center justify-center mb-1">
                <AmenityIcon icon={amenity.icon} />
              </div>
              <span className="text-xs text-gray-700 text-center">{amenity.label}</span>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 text-sm">No amenities available</p>
      )}

      {/* View All Button - only show if there are amenities */}
      {amenities.length > 0 && (
        <div className="flex justify-center mt-4">
          <button
            className="text-red-500 text-sm font-medium hover:underline transition-colors"
            onClick={() => router.push(`/PropertyAmenities/${propertyId}`)}
          >
            View All {amenities.length > 8 ? `(${amenities.length})` : ""}
          </button>
        </div>
      )}
    </motion.div>
  )
}
