"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface PropertyAmenitiesProps {
  propertyId: string;
}

interface Amenity {
  icon: string; // This is a string (like an emoji), not a component
  label: string;
}

export default function PropertyAmenities({ propertyId }: PropertyAmenitiesProps) {
  const router = useRouter();
  const [amenities, setAmenities] = useState<Amenity[]>([]);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/amenities/${propertyId}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data: Amenity[] = await response.json();
        setAmenities(data);
      } catch (error) {
        console.error("Error fetching amenities:", error);
      }
    };

    fetchAmenities();
  }, [propertyId]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-4 border-b">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Project Amenities</h3>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {amenities.map((amenity, index) => (
          <motion.div key={index} variants={itemVariants} className="flex flex-col items-center">
            <div className="w-12 h-12 flex items-center justify-center mb-1">
              <span className="text-2xl">{amenity.icon}</span> {/* Render the icon as a string */}
            </div>
            <span className="text-xs text-gray-700">{amenity.label}</span>
          </motion.div>
        ))}
      </div>

      {/* View All Button */}
      <div className="flex justify-center mt-4">
        <button
          className="text-red-500 text-sm"
          onClick={() => router.push(`/PropertyAmenities/${propertyId}`)}
        >
          View All
        </button>
      </div>
    </motion.div>
  );
}
