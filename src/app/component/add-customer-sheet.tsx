"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, User, Phone, Mail, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "react-toastify"
import { useAuth } from "@/providers/auth-provider" // Using your auth provider

interface AddCustomerSheetProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddCustomerSheet({ isOpen, onClose }: AddCustomerSheetProps) {
  // Auth context to get current user
  const { user, isAuthenticated, isLoading: isLoadingUser } = useAuth()

  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [customerType, setCustomerType] = useState("")
  const [notes, setNotes] = useState("")
  const [contactPreference, setContactPreference] = useState("phone")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sheet animation state
  const [sheetPosition, setSheetPosition] = useState(100)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const sheetRef = useRef<HTMLDivElement>(null)

  // Handle sheet animation on open/close
  useEffect(() => {
    if (isOpen) {
      // Animate in
      setTimeout(() => setSheetPosition(0), 10)
      // Lock body scroll
      document.body.style.overflow = "hidden"
    } else {
      setSheetPosition(100)
      // Unlock body scroll after animation completes
      setTimeout(() => {
        document.body.style.overflow = ""
      }, 300)
    }
  }, [isOpen])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if user is logged in
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to add a customer", {
        position: "top-right",
        autoClose: 5000,
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare customer data with creator information
      const customerData = {
        name,
        email,
        phone,
        address,
        customerType,
        notes,
        contactPreference,
        createdBy: user.id, // Using the user ID from your auth provider
        createdAt: new Date().toISOString(),
      }

      console.log("Creating customer with data:", customerData)

      // Get auth token
      const token = localStorage.getItem("authToken")

      if (!token) {
        throw new Error("Authentication token not found")
      }

      // Call your API to create customer
     
    
  
      const response = await fetch("https://api.realestatecompany.co.in/api/customer", { 
     
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      });
      
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create customer")
      }

      // Show success message
      toast.success(`${name} has been added successfully`, {
        position: "top-right",
        autoClose: 5000,
      })

      // Reset form and close
      resetForm()
      handleClose()
    } catch (error) {
      console.error("Error adding customer:", error)
      toast.error(error instanceof Error ? error.message : "Failed to add customer. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setName("")
    setEmail("")
    setPhone("")
    setAddress("")
    setCustomerType("")
    setNotes("")
    setContactPreference("phone")
  }

  // Handle close with animation
  const handleClose = () => {
    setSheetPosition(100)
    setTimeout(() => onClose(), 300)
  }

  // Touch handlers for drag to dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartY(e.touches[0].clientY)
    setCurrentY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    setCurrentY(e.touches[0].clientY)

    const deltaY = currentY - startY
    if (deltaY > 0) {
      // Only allow dragging downward
      const newPosition = (deltaY / window.innerHeight) * 100
      setSheetPosition(Math.min(newPosition, 100))
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)

    // If dragged more than 25% of the screen height, close the sheet
    if (sheetPosition > 25) {
      handleClose()
    } else {
      // Otherwise snap back to open position
      setSheetPosition(0)
    }
  }

  if (!isOpen && sheetPosition === 100) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm touch-none">
      <div
        className="fixed inset-x-0 bottom-0 z-50 touch-auto"
        style={{
          transform: `translateY(${sheetPosition}%)`,
          transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
        ref={sheetRef}
      >
        <div
          className="bg-white rounded-t-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Drag handle */}
          <div
            className="w-full h-7 flex items-center justify-center cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full my-2"></div>
          </div>

          {/* Header */}
          <div className="px-4 py-3 border-b flex items-center justify-between sticky top-0 bg-white z-10">
            <h2 className="text-lg font-semibold">Add New Customer</h2>
            <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full h-9 w-9">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Form */}
          <div className="overflow-auto flex-1">
            <form onSubmit={handleSubmit} className="p-4 space-y-5">
              {/* Creator information display */}
              {user && (
                <div className="bg-gray-50 rounded-xl p-3 text-sm">
                  <p className="text-gray-500">
                    Creating as: <span className="font-medium text-gray-700">{user.name || user.email}</span>
                  </p>
                  <p className="text-xs text-gray-400">ID: {user.id}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-3.5 text-gray-400">
                    <User className="h-5 w-5" />
                  </div>
                  <Input
                    id="name"
                    placeholder="Enter customer name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-12 pl-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-3.5 text-gray-400">
                    <Phone className="h-5 w-5" />
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="h-12 pl-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-3.5 text-gray-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 pl-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">
                  Address
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-3.5 text-gray-400">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <Textarea
                    id="address"
                    placeholder="Enter address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="pl-10 rounded-xl min-h-[80px] resize-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerType" className="text-sm font-medium">
                  Customer Type
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-3.5 text-gray-400">
                    <Users className="h-5 w-5" />
                  </div>
                  <Select value={customerType} onValueChange={setCustomerType} required>
                    <SelectTrigger id="customerType" className="h-12 pl-10 rounded-xl">
                      <SelectValue placeholder="Select customer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="investor">Investor</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Preferred Contact Method</Label>
                <RadioGroup value={contactPreference} onValueChange={setContactPreference} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phone" id="phone-contact" />
                    <Label htmlFor="phone-contact" className="cursor-pointer">
                      Phone
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email-contact" />
                    <Label htmlFor="email-contact" className="cursor-pointer">
                      Email
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="whatsapp" id="whatsapp-contact" />
                    <Label htmlFor="whatsapp-contact" className="cursor-pointer">
                      WhatsApp
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Additional Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information about the customer..."
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none rounded-xl"
                />
              </div>

              <div className="pt-3 pb-5">
                <Button
                  type="submit"
                  className="w-full h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium text-base"
                  disabled={isSubmitting || isLoadingUser || !isAuthenticated}
                >
                  {isSubmitting ? "Adding Customer..." : "Add Customer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

