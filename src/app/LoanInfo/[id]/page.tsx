"use client";

import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Share2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";

// Define the type for loan info data
interface BankInfo {
  name: string;
  logo: string;
}

// Fetch loan info data based on property ID from backend
const fetchLoanInfoData = async (id: string): Promise<BankInfo[]> => {
  try {
    const response = await fetch(`http://localhost:5000/api/bankinfo/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch loan info');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching loan info:', error);
    return [];
  }
}

export default function LoanInfoPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  // State to hold loan information
  const [loanInfoData, setLoanInfoData] = useState<BankInfo[]>([]);

  // Fetch loan info data when the component mounts
  useEffect(() => {
    const getLoanInfo = async () => {
      const data = await fetchLoanInfoData(propertyId);
      setLoanInfoData(data);
    }
    getLoanInfo();
  }, [propertyId]);

  // Share button functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Loan Approved Banks",
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Loan Approved Banks</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Report</DropdownMenuItem>
                <DropdownMenuItem>Copy Link</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-14 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 space-y-4"
        >
          <h2 className="text-xl font-semibold">Loan Approved By</h2>
          <div className="grid grid-cols-2 gap-4">
            {loanInfoData.length > 0 ? (
              loanInfoData.map((bank, index) => (
                <div key={index} className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
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
                </div>
              ))
            ) : (
              <div>No loan info available for this property.</div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
