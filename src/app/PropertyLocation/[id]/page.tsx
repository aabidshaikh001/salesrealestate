"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { FaStore, FaUtensils, FaHospital, FaSubway } from "react-icons/fa"

// Mapping API icons to React Icons (Ensure these match backend values)
const iconMap: { [key: string]: JSX.Element } = {
  store: <FaStore className="text-gray-500 text-xl" />,
  restaurant: <FaUtensils className="text-gray-500 text-xl" />,
  hospital: <FaHospital className="text-gray-500 text-xl" />,
  subway: <FaSubway className="text-gray-500 text-xl" />,
}

interface Location {
  id: number
  icon: string
  label: string
  distance: string
}

export default function PropertyLocation() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLocations = async () => {
      try {
     
        const res = await fetch(`http://localhost:5000/api/location/${propertyId}`)
     
        if (!res.ok) throw new Error("Failed to fetch data")

        const data = await res.json()
        setLocations(data) // Assuming the API returns an array of locations
      } catch (error) {
        console.error("Error fetching locations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [propertyId])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Nearby Locations</h1>
          <div className="w-10"></div> {/* Placeholder for spacing */}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-4 px-4">
        {loading ? (
          <p className="text-center text-gray-500 mt-10">Loading...</p>
        ) : locations.length > 0 ? (
          <div className="space-y-4">
            {locations.map((location) => (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white border rounded-lg p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full">
                  {iconMap[location.icon] || <FaStore className="text-gray-500 text-xl" />}
                </div>
                <div>
                  <h3 className="font-semibold">{location.label}</h3>
                  <p className="text-sm text-gray-600">{location.distance} away</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-10">No location data available.</p>
        )}
      </main>
    </div>
  )
}
