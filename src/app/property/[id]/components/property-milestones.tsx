"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface Milestone {
  name: string
  condition: string
  brokerage: string
}

interface PropertyMilestonesProps {
  propertyId: string
}

export default function PropertyMilestones({ propertyId }: PropertyMilestonesProps) {
  const [milestoneData, setMilestoneData] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMilestoneData = async () => {
      try {
     
        const response = await fetch(`https://api.realestatecompany.co.in/api/milestone/${propertyId}`)
     
        if (!response.ok) {
          throw new Error("Failed to fetch milestone data")
        }
        const data = await response.json()
        setMilestoneData(data) // Assuming API returns an array of { name, condition, brokerage }
      } catch (err) {
        console.error("Error loading milestone data:", err); // ✅ Logs the error
        setError(`Failed to load milestone data: ${err instanceof Error ? err.message : String(err)}`); // ✅ Uses the error
      }
       finally {
        setLoading(false)
      }
    }

    fetchMilestoneData()
  }, [propertyId])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="p-4 border-b"
    >
      <div className="mb-4">
        <h3 className="font-semibold text-lg">Milestones</h3>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : milestoneData.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {milestoneData.map((milestone, index) => (
            <div key={index} className="border rounded-lg p-4 min-w-[160px]">
              <h4 className="font-semibold">{milestone.name}</h4>
              <div className="mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Condition</span>
                  <span className="text-gray-500">Brokerage%</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="font-semibold">{milestone.condition}</span>
                  <span className="font-semibold">{milestone.brokerage}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No milestone information available.</p>
      )}
    </motion.div>
  )
}
