"use client"

import { useState, useEffect, useMemo } from "react"
import { HomeIcon, Plus, Menu } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { MdCurrencyRupee } from "react-icons/md"
import { BsBuildingsFill } from "react-icons/bs"
import EMICalculator from "./emi-calculator"
import RaiseQuerySheet from "./raise-query-sheet"
import MakeNewLeadSheet from "./LeadModal"
import AddCustomerSheet from "./add-customer-sheet"
import { CgProfile } from "react-icons/cg";
export default function Footer() {
  const pathname = usePathname()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("home")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isEmiCalculatorOpen, setIsEmiCalculatorOpen] = useState(false)
  const [isRaiseQueryOpen, setIsRaiseQueryOpen] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
    const [isSheetOpen, setIsSheetOpen] = useState(false)


  const navItems = useMemo(
    () => [
      { name: "Home", icon: HomeIcon, id: "home", href: "/dashboard" },
      { name: "Properties", icon: BsBuildingsFill, id: "Properties", href: "/Properties" },
      { name: "", icon: Plus, id: "visit", href: "#" },
     
    
  
      { name: "Revenue", icon: MdCurrencyRupee, id: "Revenue", href: "/revenue" },
     
      { name: "Profile", icon: CgProfile, id: "profile", href: "/profile" },
    ],
    [],
  )

  useEffect(() => {
    const currentTab = navItems.find((item) => item.href === pathname)?.id
    if (currentTab) {
      setActiveTab(currentTab)
    }
  }, [pathname, navItems])

  const handleMenuItemClick = (href: string) => {
    if (href === "/emi-calculator") {
      setIsEmiCalculatorOpen(true)
    } else if (href === "/raise-query") {
      setIsRaiseQueryOpen(true)
    }else if (href === "/add-customer") {
      setIsAddCustomerOpen(true)
    } 

    else if (href === "/make-new-lead") {
      setIsSheetOpen(true)
    }else {
      router.push(href)
    }
    setIsMenuOpen(false)
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-br from-amber-300 to-yellow-300 shadow-lg border-t border-gray-200 p-2">
        <div className="flex justify-between items-center relative">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "visit") {
                  setIsMenuOpen(!isMenuOpen)
                } else {
                  setActiveTab(item.id)
                  router.push(item.href) // Navigate to the page
                }
              }}
              className={`flex flex-col items-center justify-center p-2 relative ${
                activeTab === item.id ? "text-red-500" : "text-gray-900"
              }`}
            >
              {item.id === "visit" ? (
                <div className="bg-red-500 rounded-full p-3 -mt-10 mb-1 text-white">
                  <item.icon className="h-12 w-12" />
                </div>
              ) : (
                <item.icon className="h-7 w-7" />
              )}
              <span className="text-xs mt-1">{item.name}</span>
            </button>
          ))}
        </div>

        {/* Floating Menu */}
        {isMenuOpen && (
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-white shadow-xl rounded-lg w-48 p-2">
            {[
              { name: "Assigned Leads", href: "/leads" },
              { name: "New Lead", href: "/make-new-lead" },
              
              // { name: "Add New Customer", href: "/add-customer" },
              { name: "Raise Query", href: "/raise-query" },
              { name: "EMI Calculator", href: "/emi-calculator" },
            ].map((item, index) => (
              <button
                key={index}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 block"
                onClick={() => handleMenuItemClick(item.href)}
              >
                {item.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* EMI Calculator Modal */}
      <EMICalculator isOpen={isEmiCalculatorOpen} onClose={() => setIsEmiCalculatorOpen(false)} />

      {/* Raise Query Sheet */}
      <RaiseQuerySheet isOpen={isRaiseQueryOpen} onClose={() => setIsRaiseQueryOpen(false)} />
        <MakeNewLeadSheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)} 
      />
      <AddCustomerSheet isOpen={isAddCustomerOpen} onClose={() => setIsAddCustomerOpen(false)} />
    </>
  )
}

