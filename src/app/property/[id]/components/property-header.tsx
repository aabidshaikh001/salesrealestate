"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaArrowLeft, FaShareAlt, FaHeart } from "react-icons/fa"
import ShareModal from "../../../component/share-modal"

interface PropertyHeaderProps {
  propertyId: string
}

export default function PropertyHeader({ propertyId }: PropertyHeaderProps) {
  const router = useRouter()
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [property, setProperty] = useState<{ name: string; location: string }>({
    name: "Loading...",
    location: "Fetching location...",
  })

  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/properties/${propertyId}`)
        if (!response.ok) throw new Error("Failed to fetch")
        const data = await response.json()
        setProperty({ name: data.name, location: data.location })
      } catch (error) {
        console.error("Error fetching property:", error)
        setProperty({ name: "Unknown Property", location: "Unknown Location" })
      }
    }

    fetchPropertyData()
  }, [propertyId])

  const shareUrl =
    typeof window !== "undefined" ? window.location.href : `https://realestatecompany.co.in//properties/${propertyId}`

  return (
    <div className="sticky top-0 z-10 bg-white border-b">
      <div className="flex items-center justify-between p-4">
        <button onClick={() => router.back()} className="flex items-center text-gray-700">
          <FaArrowLeft className="mr-2" />
          <span>{property.name}</span>
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setIsShareOpen(true)}
            className="w-10 h-10 rounded-full border flex items-center justify-center"
          >
            <FaShareAlt className="text-gray-600" />
          </button>
          <button className="w-10 h-10 rounded-full border flex items-center justify-center">
            <FaHeart className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Share Modal Component */}
      <ShareModal isOpen={isShareOpen} onOpenChange={setIsShareOpen} propertyName={property.name} shareUrl={shareUrl} />
    </div>
  )
}
