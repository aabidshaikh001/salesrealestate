"use client"

import { useState, useEffect } from "react";
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import BookingModal from "./booking-modal"


interface PropertyCTAProps {
  propertyId: string
}





export default function PropertyCTA({ propertyId }: PropertyCTAProps) {
  const [ctaData, setCtaData] = useState<{ price: string; discount: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
 
  useEffect(() => {
    const fetchCTAData = async () => {
      try {
     
        
  
        const response = await fetch(`http://localhost:5000/api/properties/${propertyId}`);
     
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setCtaData(data || { price: "₹ 4.50 L - 7.25 Cr", discount: "Special offer: 8% discount" });
      } catch (error) {
        console.error("Error fetching CTA data:", error);
        setCtaData({ price: "₹ 4.50 L - 7.25 Cr", discount: "Special offer: 8% discount" }); // Default fallback
      }
    };

    fetchCTAData();
  }, [propertyId]);


  return (
    <>
      <motion.div
        className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between items-center z-10"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <div>
        <h3 className="font-bold text-lg">{ctaData?.price}</h3>
        <p className="text-xs text-gray-500">{ctaData?.discount}</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => setIsModalOpen(true)}>
            Book Visit
          </Button>
        </motion.div>
      </motion.div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        propertyId={propertyId}
        propertyName={`Property ${propertyId}`}
      />
    </>
  )
}