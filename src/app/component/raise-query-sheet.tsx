"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {  toast } from "react-toastify"
interface RaiseQuerySheetProps {
  isOpen: boolean
  onClose: () => void
}

export default function RaiseQuerySheet({ isOpen, onClose }: RaiseQuerySheetProps) {
  const [subject, setSubject] = useState("")
  const [details, setDetails] = useState("")
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
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
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
     
  
  
      const response = await fetch("http://localhost:5000/api/query", {
     
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject, details, category, phone, email }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to submit query");
      }
  
      toast.success("Query submitted successfully!", {
        autoClose: 2000,
      });
  
      // Reset form fields
      setSubject("");
      setDetails("");
      setCategory("");
      setPhone("");  // Ensure phone is also reset
      setEmail("");  // Ensure email is also reset
  
      // Close modal or form
      handleClose();
    } catch (error) {
      console.error("Error submitting query:", error);
      toast.error("Failed to submit query", {
        autoClose: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
            <h2 className="text-lg font-semibold">Raise a Query</h2>
            <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full h-9 w-9">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Form */}
          <div className="overflow-auto flex-1">
            <form onSubmit={handleSubmit} className="p-4 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Query Category
                </Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger id="category" className="h-12 rounded-xl">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payment">Payment Issues</SelectItem>
                    <SelectItem value="property">Property Details</SelectItem>
                    <SelectItem value="booking">Booking Process</SelectItem>
                    <SelectItem value="technical">Technical Support</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
  <Label htmlFor="phone" className="text-sm font-medium">
    Phone Number
  </Label>
  <Input
    id="phone"
    placeholder="Enter phone number"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    required
    className="h-12 rounded-xl"
  />
</div>

<div className="space-y-2">
    <Label htmlFor="email" className="text-sm font-medium">
        Email Address
    </Label>
    <Input
        id="email"
        placeholder="Enter email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="h-12 rounded-xl"
    />
</div>


              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium">
                  Subject
                </Label>
                <Input
                  id="subject"
                  placeholder="Enter subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="details" className="text-sm font-medium">
                  Query Details
                </Label>
                <Textarea
                  id="details"
                  placeholder="Describe your query in detail..."
                  rows={5}
                  value={details}
                 onChange={(e) => setDetails(e.target.value)}
                  required
                  className="resize-none rounded-xl"
                />
              </div>

              <div className="pt-3 pb-5">
                <Button
                  type="submit"
                  className="w-full h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Query"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

