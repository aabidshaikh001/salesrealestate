"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface PaymentPlan {
  payment: string
  milestone: string
}

interface PropertyPaymentPlanProps {
  propertyId: string
}

export default function PropertyPaymentPlan({ propertyId }: PropertyPaymentPlanProps) {
  const [paymentPlanData, setPaymentPlanData] = useState<PaymentPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPaymentPlanData = async () => {
      try {
     
       
        const response = await fetch(`https://api.realestatecompany.co.in/api/paymentplan/${propertyId}`)
     
        if (!response.ok) {
          throw new Error("Failed to fetch payment plan data")
        }
        const data = await response.json()
        setPaymentPlanData(data) // Assuming API returns an array of { payment, milestone }
      } catch (err) {
        console.error("Error loading payment plan data:", err); // ✅ Logs the error for debugging
        setError(`Failed to load payment plan data: ${err instanceof Error ? err.message : String(err)}`); // ✅ Uses the error
      }
       finally {
        setLoading(false)
      }
    }

    fetchPaymentPlanData()
  }, [propertyId])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="p-4 border-b"
    >
      <div className="mb-4">
        <h3 className="font-semibold text-lg">Payment Plan</h3>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : paymentPlanData.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-5 bg-gray-50 p-3">
            <div className="col-span-1 font-medium">Payment %</div>
            <div className="col-span-4 font-medium">Milestone</div>
          </div>

          {paymentPlanData.map((item, index) => (
            <div key={index} className="grid grid-cols-5 p-3 border-t">
              <div className="col-span-1 font-semibold">{item.payment}</div>
              <div className="col-span-4 text-sm text-gray-600">{item.milestone}</div>
            </div>
          ))}
        </div>
      ) : (
        <p>No payment plan information available.</p>
      )}
    </motion.div>
  )
}
