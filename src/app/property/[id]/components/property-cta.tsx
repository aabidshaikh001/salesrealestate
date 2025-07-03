"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import MakeNewLeadSheet from "../../../component/LeadModal"

interface PropertyCTAProps {
  propertyId: string
}

export default function PropertyCTA({ propertyId }: PropertyCTAProps) {
  const [ctaData, setCtaData] = useState<{
    title: string
    location: string
    price: string
    discount: string
  } | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchCTAData = async () => {
      try {
        const response = await fetch(`https://api.realestatecompany.co.in/api/properties/${propertyId}`)
        if (!response.ok) throw new Error("Failed to fetch")
        const data = await response.json()

        setCtaData({
          title: data.title || "Property Title",
          location: data.location || "Unknown Location",
          price: data.price || "₹ 4.50 L - 7.25 Cr",
          discount: data.discount || "Special offer: 8% discount",
        })
      } catch (error) {
        console.error("Error fetching CTA data:", error)
        setCtaData({
          title: "Property Title",
          location: "Unknown Location",
          price: "₹ 4.50 L - 7.25 Cr",
          discount: "Special offer: 8% discount",
        })
      }
    }

    fetchCTAData()
  }, [propertyId])

  return (
    <>
      <motion.div
        className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between items-center z-10"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <div>
          <h3 className="font-bold text-base">{ctaData?.title}</h3>
          <p className="text-sm text-gray-600">{ctaData?.location}</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => setIsModalOpen(true)}>
            Create Lead
          </Button>
        </motion.div>
      </motion.div>

      <MakeNewLeadSheet 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}
