"use client"

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { FaArrowLeft, FaRulerCombined, FaBed, FaBath, FaParking } from "react-icons/fa"

type Amenity = {
  iconKey: string
  label: string
}

const iconMap: Record<string, React.ElementType> = {
  sqft: FaRulerCombined,
  beds: FaBed,
  baths: FaBath,
  parking: FaParking,
}

export default function PropertyAmenitiesPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params?.id as string

  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAmenities = async () => {
      if (!propertyId) return
      
      try {
        const response = await fetch(`https://api.realestatecompany.co.in/api/amenities/${propertyId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch amenities")
        }
        
        const data = await response.json()
        
        if (data && Array.isArray(data.amenities)) {
          setAmenities(data.amenities)
        } else if (data && Array.isArray(data)) {
          setAmenities(data)
        } else {
          setAmenities([])
          setError("No amenities found for this property.")
        }
      } catch (err) {
        console.error("Fetch error:", err)
        setError("Failed to load amenities. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchAmenities()
  }, [propertyId])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-white border-b shadow-sm">
        <div className="flex items-center px-4 h-14">
          <button onClick={() => router.back()} className="mr-4 p-2 rounded-full hover:bg-gray-200">
            <FaArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">All Amenities</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-16 pb-4 px-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading amenities...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : amenities.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
            }}
            className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
          >
            {amenities.map((amenity, index) => {
              const Icon = iconMap[amenity.iconKey] || FaRulerCombined
              return (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { y: 20, opacity: 0 },
                    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
                  }}
                  className="flex flex-col items-center p-4 border rounded-lg shadow-sm"
                >
                  <div className="w-12 h-12 flex items-center justify-center mb-2">
                    <Icon className="text-gray-500 text-2xl" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{amenity.label}</span>
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          <p className="text-center text-gray-500">No amenities available for this property.</p>
        )}
      </main>
    </div>
  )
}
