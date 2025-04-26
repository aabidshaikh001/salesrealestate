"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface BankInfo {
  name: string
  logo: string
}

interface PropertyLoanInfoProps {
  propertyId: string
}

export default function PropertyLoanInfo({ propertyId }: PropertyLoanInfoProps) {
  const router = useRouter()
  const [loanInfoData, setLoanInfoData] = useState<BankInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLoanInfo = async () => {
      try {
     
      
  
        const response = await fetch(`http://localhost:5000/api/bankinfo/${propertyId}`)
     
        if (!response.ok) {
          throw new Error("Failed to fetch loan info")
        }
        const data = await response.json()
        setLoanInfoData(data) // Assuming API returns an array of { name, logo }
      }catch (err) { 
        console.error("Error loading loan info:", err); // ✅ Logs the error
        setError(`Failed to load loan info: ${err instanceof Error ? err.message : String(err)}`); // ✅ Uses the error
      }
      finally {
        setLoading(false)
      }
    }

    fetchLoanInfo()
  }, [propertyId])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="p-4 border-b"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Loan Approved By</h3>
        <button
          onClick={() => router.push(`/LoanInfo/${propertyId}`)}
          className="text-red-500 text-sm"
        >
          View All
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : loanInfoData.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {loanInfoData.map((bank, index) => (
            <div key={index} className="border rounded-lg p-4 flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center">
                <Image
                  src={bank.logo || "/placeholder.svg"}
                  alt={bank.name}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="font-medium">{bank.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <p>No loan information available.</p>
      )}
    </motion.div>
  )
}
