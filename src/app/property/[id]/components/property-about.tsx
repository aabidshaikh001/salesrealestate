"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useEffect, useState } from "react";

interface PropertyAboutProps {
  propertyId: string
}



export default function PropertyAbout({ propertyId }: PropertyAboutProps) {
  const router = useRouter()
   const [aboutData, setAboutData] = useState<string | null>(null);
 

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
     

        const response = await fetch(`https://api.realestatecompany.co.in/api/aboutproject/${propertyId}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setAboutData((data.projectDescription?.slice(0, 200) || "No description available.") + '...');

     
      } catch (error) {
        console.error("Error fetching about data:", error);
        setAboutData("No description available.");
      } 
    };

    fetchAboutData();
  }, [propertyId]);

  // Handle "View Details" button click
  const handleViewDetails = () => {
    router.push(`/About-Project/${propertyId}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="p-4 border-b"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">About the Project</h3>
        <button onClick={handleViewDetails} className="text-red-500 text-sm">
          View Details
        </button>
      </div>

      <p className="text-sm text-gray-600">{aboutData}</p>
    </motion.div>
  )
}
