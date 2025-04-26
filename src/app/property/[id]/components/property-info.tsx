"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { FaBed, FaShareAlt } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import BookingModal from "./booking-modal"
import { useState, useEffect, useMemo } from "react"
import ShareModal from "@/app/component/share-modal"

interface PropertyInfoProps {
  propertyId: string
}

interface BHKOption {
  size?: string
  type?: string
  bhk?: string
}

interface BuilderData {
  logo: string
  name?: string
}

interface PropertyData {
  id: string
  title: string
  location: string
  rating?: number
  bhkOptions: string | Array<string | BHKOption>
  price: string
  pricePerSqft?: string
  discount?: string
  visitBonus?: string
  images: string | string[]
  builderId?: string
  propertyType?: string
  status?: string
  tag?: string
  readyToMove?: boolean
  superBuiltUpArea?: string
  carpetArea?: string | null
}

const fetchPropertyData = async (propertyId: string): Promise<PropertyData | null> => {
  try {
    const res = await fetch(`https://api.realestatecompany.co.in/api/properties/${propertyId}`)
    if (!res.ok) throw new Error("Failed to fetch property data")
    return await res.json()
  } catch (error) {
    console.error("Error fetching property data:", error)
    return null
  }
}

const fetchBuilderData = async (propertyId: string): Promise<BuilderData | null> => {
  try {
    const res = await fetch(`https://api.realestatecompany.co.in/api/builderdetails/${propertyId}`)
    if (!res.ok) throw new Error("Failed to fetch builder data")
    return await res.json()
  } catch (error) {
    console.error("Error fetching builder data:", error)
    return null
  }
}

export default function PropertyInfo({ propertyId }: PropertyInfoProps) {
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null)
  const [builderData, setBuilderData] = useState<BuilderData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const property = await fetchPropertyData(propertyId)
        setPropertyData(property)

        // Fetch builder data using propertyId
        const builder = await fetchBuilderData(propertyId)
        setBuilderData(builder)
      } catch (err) {
        setError("Failed to load property details")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [propertyId])

  // Parse bhkOptions safely
  const bhkOptions = useMemo(() => {
    if (!propertyData?.bhkOptions) return []
    try {
      if (typeof propertyData.bhkOptions === "string") {
        return JSON.parse(propertyData.bhkOptions) as Array<string | BHKOption>
      }
      return propertyData.bhkOptions
    } catch (error) {
      console.error("Error parsing BHK options:", error)
      return []
    }
  }, [propertyData?.bhkOptions])

  // Format BHK options for display
  const formattedBhkOptions = useMemo(() => {
    return bhkOptions
      .map((option) => {
        if (typeof option === "string") return option
        if (option.bhk) return option.bhk
        if (option.type) return option.type
        if (option.size) return option.size
        return ""
      })
      .filter(Boolean) as string[]
  }, [bhkOptions])

  if (loading) {
    return (
      <div className="p-4 border-b animate-pulse">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="flex space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-10 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-8 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 border-b text-center text-red-500">
        {error}
        <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  if (!propertyData) {
    return <div className="p-4 border-b text-center">Property not found</div>
  }

  return (
    <div className="p-4 border-b">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Image
              src={builderData?.logo || "/placeholder.svg"}
              alt={builderData?.name ? `${builderData.name} logo` : "Builder logo"}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = "/placeholder.svg"
              }}
            />
            <div>
              <h1 className="text-xl font-bold">{propertyData.title}</h1>
              <p className="text-sm text-gray-500">{propertyData.location}</p>
            </div>
          </div>

          {propertyData.rating && (
            <div className="flex items-center mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={`w-4 h-4 ${star <= Math.round(propertyData.rating!) ? "text-amber-400" : "text-gray-300"}`}
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              ))}
            </div>
          )}
        </div>
        <button
          className="text-gray-600 hover:text-gray-800"
          aria-label="Share property"
          onClick={() => setIsShareModalOpen(true)}
        >
          <FaShareAlt />
        </button>
      </div>

      {/* BHK Options */}
      {formattedBhkOptions.length > 0 && (
        <div className="flex justify-between mt-6">
          {formattedBhkOptions.map((option, index) => (
            <motion.div key={index} whileHover={{ y: -3 }} className="flex flex-col items-center">
              <div className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-md mb-1">
                <FaBed className="text-gray-500" />
              </div>
              <span className="text-xs text-gray-600">{option}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Price */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold">{propertyData.price}</h2>
        {propertyData.pricePerSqft && <p className="text-sm text-gray-500">{propertyData.pricePerSqft}/sq.ft</p>}
        {propertyData.discount && <p className="text-sm text-green-600">{propertyData.discount}</p>}
      </div>

      {/* CTA Button */}
      <motion.div className="mt-4" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button className="w-full rounded-md bg-blue-500 hover:bg-blue-600" onClick={() => setIsModalOpen(true)}>
          Book Visit
        </Button>
      </motion.div>

      {/* Visit Bonus */}
      {propertyData.visitBonus && (
        <div className="mt-3 flex justify-center">
          <span className="bg-red-100 text-red-600 text-xs font-medium px-3 py-1 rounded-md">
            {propertyData.visitBonus}
          </span>
        </div>
      )}

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        propertyId={propertyId}
        propertyName={propertyData.title}
      />
      <ShareModal
        isOpen={isShareModalOpen}
        onOpenChange={setIsShareModalOpen}
        propertyName={propertyData.title}
        shareUrl={typeof window !== "undefined" ? window.location.href : `http://localhost:3000/property/${propertyId}`}
      />
    </div>
  )
}
