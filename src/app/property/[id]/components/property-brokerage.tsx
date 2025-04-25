"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface PropertyBrokerageProps {
  propertyId: string;
}

export default function PropertyBrokerage({ propertyId }: PropertyBrokerageProps) {
  const [brokerage, setBrokerage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrokerage = async () => {
      try {
        const response = await fetch(`https://api.realestatecompany.co.in/api/properties/${propertyId}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setBrokerage(data.brokerage || "N/A"); // Fallback in case API doesn't return a value
      } catch (error) {
        console.error("Error fetching brokerage data:", error);
        setBrokerage("N/A"); // Default fallback
      } finally {
        setLoading(false); // Set loading to false once the fetch is done
      }
    };

    fetchBrokerage();
  }, [propertyId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="p-4 border-b"
    >
      <div className="mb-4">
        <h3 className="font-semibold text-lg">Brokerage Payout Plan</h3>
      </div>

      <div className="border rounded-lg p-4">
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <>
            <h4 className="font-semibold">Brokerage {brokerage}</h4>
            <p className="text-sm text-gray-500 mt-1">Platform charges & applicable taxes shall be deducted</p>
          </>
        )}
      </div>
    </motion.div>
  );
}
