"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FaPlus, FaChevronRight } from "react-icons/fa"
import { MapPin, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import Image from "next/image"

interface LocationData {
  propertyId: string
  Location: string
  Time: string
  LocationTypeId: string
  Label: string
  Icon: string
}

interface Property {
  latitude: number
  longitude: number
}

interface PropertyLocationProps {
  propertyId: string
}

function constructMapUrl(latitude: number, longitude: number): string {
  return `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`
}

export default function PropertyLocation({ propertyId }: PropertyLocationProps) {
  const router = useRouter()
  const [locationData, setLocationData] = useState<LocationData[]>([])
  const [propertyCoordinates, setPropertyCoordinates] = useState<Property | null>(null)
  const [mapUrl, setMapUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const locationResponse = await fetch(`https://api.realestatecompany.co.in/api/location/${propertyId}`)
        if (!locationResponse.ok) {
          throw new Error("Failed to fetch location data")
        }
        const locationData = await locationResponse.json()
        setLocationData(locationData)

        const propertyResponse = await fetch(`https://api.realestatecompany.co.in/api/properties/${propertyId}`)
        if (!propertyResponse.ok) {
          throw new Error("Failed to fetch property data")
        }
        const propertyData = await propertyResponse.json()
        setPropertyCoordinates(propertyData)

        if (propertyData.latitude && propertyData.longitude) {
          setMapUrl(constructMapUrl(propertyData.latitude, propertyData.longitude))
        }
      } catch (err) {
        console.error("Error loading location data:", err)
        setError(`Failed to load data: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setLoading(false)
      }
    }

    fetchLocationData()
  }, [propertyId])

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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Location Advantages</h3>
            <p className="text-sm text-gray-600 mt-1">Nearby places & amenities</p>
          </div>
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
            {locationData.length} places
          </div>
        </div>
      </div>

      {/* Map Section */}
      <motion.div variants={itemVariants} className="relative h-48 bg-gray-100 overflow-hidden">
        {mapUrl ? (
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />
        ) : (
          <div className="flex justify-center items-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              <div className="animate-pulse bg-gray-300 rounded-full w-8 h-8 mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">Loading map...</p>
            </div>
          </div>
        )}

        {/* Map Controls */}
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg hover:bg-white transition-colors">
            <FaPlus className="text-gray-700 text-sm" />
          </button>
          <button className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg hover:bg-white transition-colors">
            <FaPlus className="text-gray-700 text-sm rotate-45" />
          </button>
        </div>

        {/* Map Overlay Info */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-gray-900">Property Location</span>
          </div>
        </div>
      </motion.div>

      {/* Locations List */}
      <div className="p-5">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-gray-600 font-medium">Loading locations...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="text-red-500 text-2xl mb-2">⚠️</div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        ) : locationData.length > 0 ? (
          <div className="space-y-3">
            {locationData.slice(0, 5).map((location, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                {/* Icon on the left */}
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 group-hover:scale-105 transition-transform">
                  <Image
                    src={location.Icon || "/placeholder.svg"}
                    alt={location.Label}
                    width={24}
                    height={24}
                    className="object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                    }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                 
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-md font-medium">
                      {location.Label}
                    </span>
                    
                  </div>
                   <h4 className="font-semibold text-gray-900 text-base leading-tight">
                    {location.Location} <span className="text-blue-600 font-medium">({location.Time} min)</span>
                  </h4>
                </div>

                {/* Arrow */}
                <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                  <FaChevronRight className="h-4 w-4" />
                </div>
              </motion.div>
            ))}

            {/* Show more indicator */}
            {locationData.length > 5 && (
              <div className="text-center pt-2">
                <div className="text-sm text-gray-500 bg-gray-50 rounded-lg py-2 px-4 inline-block">
                  +{locationData.length - 5} more locations
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-3">📍</div>
            <p className="text-gray-600 font-medium">No location information available</p>
          </div>
        )}
      </div>

      {/* View All Button */}
      {locationData.length > 0 && (
        <div className="px-5 pb-5">
          <button
            onClick={() => router.push(`/PropertyLocation/${propertyId}`)}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            <span>View All Locations</span>
            <FaChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </motion.div>
  )
}
